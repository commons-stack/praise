import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ISelectedItem {
  key: string;
  label: string;
}

interface MultiselectInputProps {
  selected: ISelectedItem[];
  handleChange: (element) => void;
  options: ISelectedItem[];
  noSelectedMessage: string;
}

const MultiselectInput = ({
  handleChange,
  selected,
  options,
  noSelectedMessage,
}: MultiselectInputProps): JSX.Element => {
  return (
    <div className="relative w-60 border border-gray-400 h-[42px]">
      <Listbox value={selected} onChange={handleChange} multiple>
        <Listbox.Button className=" pl-2 pr-8 text-left h-[42px] w-full bg-transparent border-none outline-none focus:ring-0 ">
          {(): JSX.Element => (
            <>
              <span className="block truncate">
                {selected.length === 0 && noSelectedMessage}
                {selected.length > 3
                  ? `${selected.length} items.`
                  : selected
                      .map((filter) =>
                        filter && filter.label ? filter.label : ''
                      )
                      .join(', ')}
              </span>

              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-800">
                  <FontAwesomeIcon icon={faChevronDown} className="mt-[-1]" />
                </span>
              </div>
            </>
          )}
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto bg-white border border-gray-400 max-h-60">
            {options.map((filter, filterIdx) => (
              <Listbox.Option
                key={filterIdx}
                className={({ active }): string =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                  }`
                }
                value={filter}
              >
                {({ selected }): JSX.Element => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {filter.label}
                    </span>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mr-4 text-black focus:ring-0"
                        checked={selected}
                        onChange={(): void => {}}
                      />
                    </span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
};

export default MultiselectInput;
