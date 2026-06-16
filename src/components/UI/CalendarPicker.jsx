// src/components/UI/CalendarPicker.jsx
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { forwardRef } from 'react';

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full">
    <Calendar
      size={15}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
    />
    <input
      readOnly
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder || 'Select date'}
      className="input-field pl-9 cursor-pointer"
    />
  </div>
));
CustomInput.displayName = 'CustomInput';

/**
 * Single-date calendar picker
 * Props: selected (Date|null), onChange (Date) => void, placeholder, maxDate, minDate
 */
export default function CalendarPicker({ selected, onChange, placeholder, maxDate, minDate }) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd MMM yyyy"
      placeholderText={placeholder || 'Select date'}
      customInput={<CustomInput placeholder={placeholder} />}
      maxDate={maxDate}
      minDate={minDate}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      popperPlacement="bottom-start"
    />
  );
}
