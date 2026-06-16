// src/components/UI/DateRangePicker.jsx
import DatePicker from 'react-datepicker';
import { Calendar, ArrowRight, X } from 'lucide-react';
import { forwardRef } from 'react';

const RangeInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative w-full">
    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
    <input
      readOnly
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      className="input-field pl-9 cursor-pointer"
    />
  </div>
));
RangeInput.displayName = 'RangeInput';

/**
 * Date range picker — two separate pickers (from / to)
 * Props: startDate, endDate (Date|null), onStartChange, onEndChange, onClear
 */
export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, onClear }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center min-w-[450px] gap-4">
        <DatePicker
          selected={startDate}
          onChange={onStartChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate || new Date()}
          dateFormat="dd MMM yyyy"
          placeholderText="From date"
          customInput={<RangeInput placeholder="From date" />}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          popperPlacement="bottom-start"
        />
      
      <ArrowRight size={16} className="text-slate-400 dark:text-slate-600 shrink-0" />
      
        <DatePicker
          selected={endDate}
          onChange={onEndChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          maxDate={new Date()}
          dateFormat="dd MMM yyyy"
          placeholderText="To date"
          customInput={<RangeInput placeholder="To date" />}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          popperPlacement="bottom-start"
        />
      </div>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="btn-icon shrink-0"
          title="Clear date range"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
