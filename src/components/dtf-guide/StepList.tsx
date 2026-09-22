import type { DTFStep } from "./dtfSteps"; // <-- Added 'type' here

interface StepListProps {
  steps: DTFStep[];
  activeStep: number;
  onSelect: (index: number) => void;
  setStepRef: (index: number) => (el: HTMLLIElement | null) => void;
}

export function StepList({ steps, activeStep, onSelect, setStepRef }: StepListProps) {
  return (
    <ul className="flex flex-col gap-12 border-l-2 border-gray-100 pl-6 lg:pl-8">
      {steps.map((step, i) => {
        const isActive = activeStep === i;
        
        return (
          <li
            key={i}
            ref={setStepRef(i)}
            onClick={() => onSelect(i)}
            className={`relative cursor-pointer transition-all duration-300 ${
              isActive ? "opacity-100 scale-100" : "opacity-40 scale-95 hover:opacity-70"
            }`}
          >
            {/* Active Indicator Dot */}
            <div 
              className={`absolute -left-[29px] lg:-left-[37px] top-1 h-4 w-4 rounded-full transition-colors duration-300 ${
                isActive ? "bg-blue-600" : "bg-gray-300"
              }`} 
            />
            
            <h3 className={`text-xl md:text-2xl font-semibold mb-2 transition-colors duration-300 ${
              isActive ? "text-gray-900" : "text-gray-600"
            }`}>
              {i + 1}. {step.title}
            </h3>
            
            <p className="text-gray-600 md:text-lg leading-relaxed">
              {step.description}
            </p>
          </li>
        );
      })}
    </ul>
  );
}