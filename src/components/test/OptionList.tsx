import type { QuestionOption, QuestionType } from '@/types/api'
import './OptionList.css'

interface OptionListProps {
  options: QuestionOption[]
  questionType: QuestionType
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  correctIds?: string[]
  showResults?: boolean
}

export function OptionList({
  options,
  questionType,
  selectedIds,
  onChange,
  disabled = false,
  correctIds,
  showResults = false,
}: OptionListProps) {
  function handleSelect(optionId: string) {
    if (disabled) return

    if (questionType === 'single') {
      onChange([optionId])
    } else {
      if (selectedIds.includes(optionId)) {
        onChange(selectedIds.filter((id) => id !== optionId))
      } else {
        onChange([...selectedIds, optionId])
      }
    }
  }

  return (
    <div className="option-list" role={questionType === 'single' ? 'radiogroup' : 'group'}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id)
        const isCorrect = showResults && correctIds?.includes(option.id)
        const isIncorrect = showResults && isSelected && !correctIds?.includes(option.id)

        return (
          <label
            key={option.id}
            className={[
              'option-list__item',
              isSelected ? 'option-list__item--selected' : '',
              isCorrect ? 'option-list__item--correct' : '',
              isIncorrect ? 'option-list__item--incorrect' : '',
              disabled ? 'option-list__item--disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type={questionType === 'single' ? 'radio' : 'checkbox'}
              className="option-list__input"
              checked={isSelected}
              onChange={() => handleSelect(option.id)}
              disabled={disabled}
              name="question-option"
            />
            <span className="option-list__text">{option.text}</span>
          </label>
        )
      })}
    </div>
  )
}
