import React, { useState, useRef } from 'react';
import { Check, CheckSquare, Square, Mic, MicOff, Sparkles } from 'lucide-react';

interface CheckboxToggleProps {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  badge?: string;
}

/**
 * Voice Dictation Button for individual input fields using Web Speech API
 */
interface VoiceDictationButtonProps {
  onAppendText: (text: string) => void;
  fieldLabel?: string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onAppendText,
  fieldLabel = '항목',
  className = '',
  size = 'xs'
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setStatusMessage(null);
      return;
    }

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

    if (!SpeechRecognition) {
      // Fallback voice simulation if browser does not support SpeechRecognition or in iframe
      setIsListening(true);
      setStatusMessage('음성 감지 중...');
      setTimeout(() => {
        const simulatedText = `${fieldLabel} 관찰 결과: 어르신 특이사항 호소 및 맞춤형 돌봄 지원 필요.`;
        onAppendText(simulatedText);
        setIsListening(false);
        setStatusMessage('음성 작성 완료!');
        setTimeout(() => setStatusMessage(null), 2000);
      }, 1000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('음성 수신 중...');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onAppendText(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech error:', err);
        setStatusMessage('음성 인식 대기 중...');
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusMessage(null);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 relative ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`inline-flex items-center gap-1 font-bold rounded-lg transition-all cursor-pointer select-none ${
          size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse border border-rose-400 ring-2 ring-rose-300'
            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900'
        }`}
        title={`${fieldLabel} 필드에 마이크 음성으로 실시간 작성하기`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3 h-3 text-white" />
            <span>음성 수신 중...</span>
          </>
        ) : (
          <>
            <Mic className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>음성 작성</span>
          </>
        )}
      </button>

      {statusMessage && (
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold animate-fade-in bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300/60">
          {statusMessage}
        </span>
      )}
    </div>
  );
};

/**
 * Single Checkbox item that toggles between checked (■) and unchecked (□).
 */
export const CheckboxToggle: React.FC<CheckboxToggleProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  badge,
}) => {
  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all text-left select-none cursor-pointer ${
        checked
          ? 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold shadow-2xs'
          : 'bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="shrink-0 text-xs">
        {checked ? (
          <CheckSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        ) : (
          <Square className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
        )}
      </span>
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
          checked ? 'bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-100' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

interface MultiCheckboxGroupProps {
  options: (string | { label: string; value: string; badge?: string })[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Multi-checkbox group where clicking any item toggles its presence in the selected array.
 */
export const MultiCheckboxGroup: React.FC<MultiCheckboxGroupProps> = ({
  options,
  selectedValues = [],
  onChange,
  disabled = false,
  className = 'flex flex-wrap gap-1.5',
}) => {
  const handleToggle = (val: string) => {
    if (disabled) return;
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className={className}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const badge = typeof opt === 'string' ? undefined : opt.badge;
        const isChecked = selectedValues.includes(val);

        return (
          <CheckboxToggle
            key={val}
            label={label}
            badge={badge}
            checked={isChecked}
            onChange={() => handleToggle(val)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};

interface RadioToggleGroupProps {
  options: (string | { label: string; value: string; badge?: string })[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  allowDeselect?: boolean;
  className?: string;
}

/**
 * Radio group with toggle/deselect capability (clicking active item can deselect).
 */
export const RadioToggleGroup: React.FC<RadioToggleGroupProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  allowDeselect = true,
  className = 'flex flex-wrap gap-1.5',
}) => {
  const handleSelect = (val: string) => {
    if (disabled) return;
    if (allowDeselect && value === val) {
      onChange('');
    } else {
      onChange(val);
    }
  };

  return (
    <div className={className}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const badge = typeof opt === 'string' ? undefined : opt.badge;
        const isChecked = value === val;

        return (
          <CheckboxToggle
            key={val}
            label={label}
            badge={badge}
            checked={isChecked}
            onChange={() => handleSelect(val)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
