"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Check, X } from "lucide-react";

import { Card } from "../../../components/ui/Card";

interface Address {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

const emptyAddress: Address = {
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
  email: "",
  phone: "",
};

export default function DashboardAddressesPage() {
  const [billing, setBilling] =
    useState<Address>(emptyAddress);

  const [shipping, setShipping] =
    useState<Address>(emptyAddress);

  const [editingBilling, setEditingBilling] =
    useState(false);

  const [editingShipping, setEditingShipping] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState<
    "billing" | "shipping" | null
  >(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/account/addresses",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load addresses."
        );
      }

      setBilling(
        result.billing || emptyAddress
      );

      setShipping(
        result.shipping || emptyAddress
      );
    } catch (error) {
      console.error(
        "LOAD_ADDRESSES_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load addresses."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveAddress(
    type: "billing" | "shipping"
  ) {
    try {
      setSaving(type);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/account/addresses",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [type]:
              type === "billing"
                ? billing
                : shipping,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save address."
        );
      }

      if (result.billing) {
        setBilling(result.billing);
      }

      if (result.shipping) {
        setShipping(result.shipping);
      }

      if (type === "billing") {
        setEditingBilling(false);
      } else {
        setEditingShipping(false);
      }

      setMessage(
        `${
          type === "billing"
            ? "Billing"
            : "Shipping"
        } address updated successfully.`
      );
    } catch (error) {
      console.error(
        "SAVE_ADDRESS_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save address."
      );
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Addresses
          </h1>

          <p className="text-primary-400 mt-1">
            Manage your billing and shipping addresses.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <div className="h-5 w-32 animate-pulse rounded bg-primary-50" />

            <div className="mt-5 space-y-3">
              <div className="h-4 w-48 animate-pulse rounded bg-primary-50" />
              <div className="h-4 w-64 animate-pulse rounded bg-primary-50" />
              <div className="h-4 w-40 animate-pulse rounded bg-primary-50" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="h-5 w-32 animate-pulse rounded bg-primary-50" />

            <div className="mt-5 space-y-3">
              <div className="h-4 w-48 animate-pulse rounded bg-primary-50" />
              <div className="h-4 w-64 animate-pulse rounded bg-primary-50" />
              <div className="h-4 w-40 animate-pulse rounded bg-primary-50" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Addresses
        </h1>

        <p className="text-primary-400 mt-1">
          The following addresses will be used on
          the checkout page by default.
        </p>
      </div>

      {/* SUCCESS */}
      {message && (
        <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ADDRESS CARDS */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* BILLING */}
        <AddressCard
          title="Billing address"
          address={billing}
          editing={editingBilling}
          saving={saving === "billing"}
          onEdit={() => {
            setMessage("");
            setError("");
            setEditingBilling(true);
          }}
          onCancel={() => {
            setEditingBilling(false);
            loadAddresses();
          }}
          onSave={() =>
            saveAddress("billing")
          }
          onChange={setBilling}
          showEmail
          showPhone
        />

        {/* SHIPPING */}
        <AddressCard
          title="Shipping address"
          address={shipping}
          editing={editingShipping}
          saving={saving === "shipping"}
          onEdit={() => {
            setMessage("");
            setError("");
            setEditingShipping(true);
          }}
          onCancel={() => {
            setEditingShipping(false);
            loadAddresses();
          }}
          onSave={() =>
            saveAddress("shipping")
          }
          onChange={setShipping}
        />
      </div>
    </div>
  );
}

function AddressCard({
  title,
  address,
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
  onChange,
  showEmail = false,
  showPhone = false,
}: {
  title: string;
  address: Address;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (address: Address) => void;
  showEmail?: boolean;
  showPhone?: boolean;
}) {
  const updateField = (
    field: keyof Address,
    value: string
  ) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  const hasAddress =
    address.first_name ||
    address.last_name ||
    address.address_1 ||
    address.city ||
    address.postcode;

  return (
    <Card className="overflow-hidden">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between border-b border-primary-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <MapPin size={18} />
          </span>

          <h2 className="font-semibold text-primary-900">
            {title}
          </h2>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent-600 hover:underline"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={address.first_name}
                onChange={(value) =>
                  updateField(
                    "first_name",
                    value
                  )
                }
              />

              <Input
                label="Last name"
                value={address.last_name}
                onChange={(value) =>
                  updateField(
                    "last_name",
                    value
                  )
                }
              />
            </div>

            <Input
              label="Company"
              value={address.company}
              onChange={(value) =>
                updateField(
                  "company",
                  value
                )
              }
            />

            <Input
              label="Address"
              value={address.address_1}
              onChange={(value) =>
                updateField(
                  "address_1",
                  value
                )
              }
            />

            <Input
              label="Apartment, suite, etc."
              value={address.address_2}
              onChange={(value) =>
                updateField(
                  "address_2",
                  value
                )
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="City"
                value={address.city}
                onChange={(value) =>
                  updateField(
                    "city",
                    value
                  )
                }
              />

              <Input
                label="State"
                value={address.state}
                onChange={(value) =>
                  updateField(
                    "state",
                    value
                  )
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Postcode"
                value={address.postcode}
                onChange={(value) =>
                  updateField(
                    "postcode",
                    value
                  )
                }
              />

              <Input
                label="Country"
                value={address.country}
                onChange={(value) =>
                  updateField(
                    "country",
                    value
                  )
                }
              />
            </div>

            {showEmail && (
              <Input
                label="Email"
                type="email"
                value={address.email || ""}
                onChange={(value) =>
                  updateField(
                    "email",
                    value
                  )
                }
              />
            )}

            {showPhone && (
              <Input
                label="Phone"
                type="tel"
                value={address.phone || ""}
                onChange={(value) =>
                  updateField(
                    "phone",
                    value
                  )
                }
              />
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={15} />

                {saving
                  ? "Saving..."
                  : "Save Address"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-primary-100 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:opacity-50"
              >
                <X size={15} />

                Cancel
              </button>
            </div>
          </div>
        ) : hasAddress ? (
          <div className="text-sm leading-6 text-primary-600">
            <p className="font-semibold text-primary-900">
              {address.first_name}{" "}
              {address.last_name}
            </p>

            {address.company && (
              <p>{address.company}</p>
            )}

            <p>{address.address_1}</p>

            {address.address_2 && (
              <p>{address.address_2}</p>
            )}

            <p>
              {address.city}
              {address.state
                ? `, ${address.state}`
                : ""}{" "}
              {address.postcode}
            </p>

            <p>{address.country}</p>

            {showEmail &&
              address.email && (
                <p className="mt-2">
                  {address.email}
                </p>
              )}

            {showPhone &&
              address.phone && (
                <p>{address.phone}</p>
              )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-primary-400">
              You have not set up this type of
              address yet.
            </p>

            <button
              type="button"
              onClick={onEdit}
              className="mt-4 text-sm font-semibold text-accent-600 hover:underline"
            >
              Add {title}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-primary-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-primary-100 bg-white px-3 py-2.5 text-sm text-primary-900 outline-none transition placeholder:text-primary-300 focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
      />
    </label>
  );
}
