import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ISelectedItem {
  value: string;
  label: string;
}

interface SelectInputProps {
  selected: ISelectedItem;
  handleChange: (element) => void;
  options: ISelectedItem[];
  icon?: IconProp;
}

const SelectInput = ({
  selected,
  handleChange,
  options,
  icon,
}: SelectInputProps): JSX.Element => {
  return (
    <div className="relative w-40 h-[42px]">
      <Listbox value={selected} onChange={handleChange}>
        <Listbox.Button className="h-[42px] border border-gray-400 w-full py-1.5 pl-3 pr-10 text-left bg-transparent ">
          <span className="block truncate">{selected.label}</span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-800 ">
              <FontAwesomeIcon icon={icon || faChevronDown} />
            </span>
          </div>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto bg-white border border-gray-400 max-h-60">
            {options.map((s, sIdx) => (
              <Listbox.Option
                key={sIdx}
                className={({ active }): string =>
                  `relative cursor-default select-none py-2 pl-4 pr-4 ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`
                }
                value={s}
              >
                {({ selected }): JSX.Element => (
                  <span
                    className={`block truncate ${
                      selected ? 'font-medium' : 'font-normal'
                    }`}
                  >
                    {s.label}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
};

export default SelectInput;
