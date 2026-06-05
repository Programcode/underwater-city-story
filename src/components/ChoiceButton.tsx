import type { StoryChoice } from '../types';

type ChoiceButtonProps = {
  choice: StoryChoice;
  disabled: boolean;
  onChoose: (choiceId: string) => void;
};

export function ChoiceButton({ choice, disabled, onChoose }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      className="choice-button"
      disabled={disabled}
      onClick={() => onChoose(choice.id)}
    >
      <span className="choice-button__label">{choice.label}</span>
      <span className="choice-button__description">{choice.description}</span>
      {disabled ? <span className="choice-button__lock">Discover the linked map clue first</span> : null}
    </button>
  );
}
