<?php
/**
 * Plugin Name: MyStore Checkout Cart Handoff
 * Description: Restores the authenticated MyStore cart and applies server-side line pricing before checkout.
 * Version: 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter(
	'woocommerce_add_cart_item_data',
	'mystore_capture_base_unit_price',
	20,
	4
);

function mystore_capture_base_unit_price( $cart_item_data, $product_id, $variation_id, $quantity ) {
	$is_mystore_item =
		isset( $cart_item_data['custom_width'] ) ||
		isset( $cart_item_data['custom_height'] ) ||
		isset( $cart_item_data['custom_job_name'] );

	if ( ! $is_mystore_item ) {
		return $cart_item_data;
	}

	$product = wc_get_product( $variation_id ?: $product_id );
	if ( $product ) {
		$cart_item_data['mystore_base_unit_price'] = (float) $product->get_price();
	}

	return $cart_item_data;
}

add_action( 'plugins_loaded', function () {
	remove_action(
		'woocommerce_before_calculate_totals',
		'mystore_set_custom_cart_prices',
		20
	);

	add_action(
		'woocommerce_before_calculate_totals',
		'mystore_set_minimum_custom_cart_prices',
		20
	);
}, PHP_INT_MAX );

function mystore_set_minimum_custom_cart_prices( $cart ) {
	if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
		return;
	}

	if ( ! $cart || $cart->is_empty() ) {
		return;
	}

	foreach ( $cart->get_cart() as $cart_item ) {
		if (
			empty( $cart_item['data'] ) ||
			! $cart_item['data'] instanceof WC_Product ||
			! isset( $cart_item['mystore_base_unit_price'] )
		) {
			continue;
		}

		$quantity = max( 1, (int) $cart_item['quantity'] );
		$line_price = max(
			(float) $cart_item['mystore_base_unit_price'] * $quantity,
			5.00
		);

		$service = strtolower(
			trim(
				preg_replace(
					'/\s*\(\+\$10\.00\)\s*$/i',
					'',
					(string) ( $cart_item['custom_additional_service'] ?? '' )
				)
			)
		);

		if (
			$service === 'remove white background' ||
			$service === 'remove black background'
		) {
			$line_price += 10.00;
		}

		$cart_item['data']->set_price( $line_price / $quantity );
	}
}

function mystore_get_custom_cart_item_key( $item ) {
	return md5(
		wp_json_encode(
			[
				'product_id'         => (int) ( $item['id'] ?? 0 ),
				'width'              => (string) ( $item['width'] ?? '' ),
				'height'             => (string) ( $item['height'] ?? '' ),
				'job_name'           => (string) ( $item['jobName'] ?? '' ),
				'additional_service' => (string) ( $item['additionalService'] ?? '' ),
				'file_url'           => (string) ( $item['fileUrl'] ?? '' ),
			]
		)
	);
}

add_filter(
	'rest_request_after_callbacks',
	function ( $response, $handler, $request ) {
		if (
			! $request instanceof WP_REST_Request ||
			$request->get_method() !== 'GET' ||
			$request->get_route() !== '/mystore/v1/cart' ||
			is_wp_error( $response ) ||
			! $response instanceof WP_REST_Response
		) {
			return $response;
		}

		$data = $response->get_data();
		if ( empty( $data['items'] ) || ! is_array( $data['items'] ) ) {
			return $response;
		}

		foreach ( $data['items'] as &$item ) {
			if ( is_array( $item ) ) {
				$item['key'] = mystore_get_custom_cart_item_key( $item );
			}
		}
		unset( $item );

		$response->set_data( $data );
		return $response;
	},
	10,
	3
);

add_action( 'woocommerce_checkout_create_order', function ( $order, $data ) {
	if ( ! function_exists( 'WC' ) || ! WC()->session ) {
		return;
	}

	$user_id = sanitize_text_field(
		(string) WC()->session->get( 'mystore_user_id', '' )
	);
	$customer_id = absint( WC()->session->get( 'mystore_woo_customer_id', 0 ) );
	if ( $customer_id ) {
		$order->set_customer_id( $customer_id );
		$order->update_meta_data( '_mystore_woocommerce_customer_id', $customer_id );
	}

	if ( preg_match( '/^[a-f0-9]{24}$/i', $user_id ) ) {
		$order->update_meta_data( '_mystore_user_id', $user_id );
	}
}, 10, 2 );

function mystore_clear_custom_cart_for_order( $order ) {
	if ( is_numeric( $order ) ) {
		$order = wc_get_order( $order );
	}

	if ( ! $order instanceof WC_Order ) {
		return;
	}

	$user_id = sanitize_text_field(
		(string) $order->get_meta( '_mystore_user_id', true )
	);
	if (
		! preg_match( '/^[a-f0-9]{24}$/i', $user_id ) &&
		function_exists( 'WC' ) &&
		WC()->session
	) {
		$user_id = sanitize_text_field(
			(string) WC()->session->get( 'mystore_user_id', '' )
		);
	}
	$customer_id = absint( $order->get_meta( '_mystore_woocommerce_customer_id', true ) );
	if ( ! $customer_id && function_exists( 'WC' ) && WC()->session ) {
		$customer_id = absint( WC()->session->get( 'mystore_woo_customer_id', 0 ) );
	}
	if ( $customer_id && (int) $order->get_customer_id() !== $customer_id ) {
		$order->set_customer_id( $customer_id );
		$order->update_meta_data( '_mystore_woocommerce_customer_id', $customer_id );
	}

	if ( ! preg_match( '/^[a-f0-9]{24}$/i', $user_id ) ) {
		return;
	}

	if ( $order->get_meta( '_mystore_user_id', true ) !== $user_id ) {
		$order->update_meta_data( '_mystore_user_id', $user_id );
		$order->save();
	}

	delete_transient( 'mystore_cart_' . md5( $user_id ) );

	if (
		function_exists( 'WC' ) &&
		WC()->session &&
		WC()->session->get( 'mystore_user_id' ) === $user_id
	) {
		WC()->session->set( 'mystore_user_id', '' );
		WC()->session->set( 'mystore_woo_customer_id', 0 );
		WC()->session->save_data();
	}
}

add_action(
	'woocommerce_checkout_order_processed',
	function ( $order_id, $posted_data, $order ) {
		mystore_clear_custom_cart_for_order( $order ?: $order_id );
	},
	10,
	3
);

add_action(
	'woocommerce_store_api_checkout_order_processed',
	'mystore_clear_custom_cart_for_order',
	10,
	1
);

add_action( 'rest_api_init', function () {
	register_rest_route(
		'mystore/v1',
		'/checkout/handoff',
		[
			'methods'             => 'GET',
			'callback'            => 'mystore_checkout_handoff_callback',
			'permission_callback' => '__return_true',
		]
	);
} );

function mystore_checkout_handoff_callback( WP_REST_Request $request ) {
	if (
		! defined( 'MYSTORE_API_SECRET' ) ||
		! function_exists( 'mystore_initialize_woocommerce' ) ||
		! function_exists( 'mystore_sync_to_wc_cart' )
	) {
		return new WP_Error(
			'mystore_handoff_unavailable',
			'Checkout handoff is not configured.',
			[ 'status' => 500 ]
		);
	}

	$user_id  = sanitize_text_field( (string) $request->get_param( 'user_id' ) );
	$customer_id = absint( $request->get_param( 'customer_id' ) );
	$expires  = absint( $request->get_param( 'expires' ) );
	$nonce    = sanitize_text_field( (string) $request->get_param( 'nonce' ) );
	$signature = sanitize_text_field( (string) $request->get_param( 'signature' ) );

	if (
		! preg_match( '/^[a-f0-9]{24}$/i', $user_id ) ||
		! $customer_id ||
		! preg_match( '/^[a-f0-9]{32}$/', $nonce ) ||
		! preg_match( '/^[a-f0-9]{64}$/', $signature ) ||
		$expires < time() ||
		$expires > time() + 300
	) {
		return new WP_Error(
			'mystore_handoff_invalid',
			'Checkout link is invalid or expired. Please try again.',
			[ 'status' => 403 ]
		);
	}

	$payload = $user_id . '|' . $customer_id . '|' . $expires . '|' . $nonce;
	$expected_signature = hash_hmac(
		'sha256',
		$payload,
		MYSTORE_API_SECRET
	);

	if ( ! hash_equals( $expected_signature, $signature ) ) {
		return new WP_Error(
			'mystore_handoff_invalid',
			'Checkout link is invalid or expired. Please try again.',
			[ 'status' => 403 ]
		);
	}

	$used_nonce_key = 'mystore_handoff_' . hash( 'sha256', $nonce );
	if ( get_transient( $used_nonce_key ) ) {
		return new WP_Error(
			'mystore_handoff_reused',
			'This checkout link has already been used. Please try again.',
			[ 'status' => 403 ]
		);
	}

	$cart = get_transient( 'mystore_cart_' . md5( $user_id ) );
	if ( ! is_array( $cart ) || empty( $cart ) ) {
		return new WP_Error(
			'mystore_handoff_empty_cart',
			'Your cart is empty.',
			[ 'status' => 400 ]
		);
	}

	if ( ! mystore_initialize_woocommerce() ) {
		return new WP_Error(
			'mystore_handoff_woocommerce_unavailable',
			'WooCommerce is not available.',
			[ 'status' => 500 ]
		);
	}

	WC()->session->set_customer_session_cookie( true );
	WC()->session->set( 'mystore_user_id', $user_id );
	WC()->session->set( 'mystore_woo_customer_id', $customer_id );
	mystore_sync_to_wc_cart( $cart );
	WC()->cart->calculate_totals();
	WC()->cart->set_session();
	WC()->session->save_data();

	set_transient( $used_nonce_key, true, max( 1, $expires - time() ) );

	nocache_headers();
	header( 'Referrer-Policy: no-referrer' );
	wp_safe_redirect( wc_get_checkout_url() );
	exit;
}