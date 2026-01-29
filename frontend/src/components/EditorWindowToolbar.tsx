import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react";
import { IconButton } from "./IconButton";
import {
  useCallback,
  useEffect,
  type PropsWithChildren,
  type RefObject
} from "react";

interface EditorWindowToolbarProps {
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
}

interface TextAreaState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const getTextAreaState = (ref: RefObject<HTMLTextAreaElement | null>): TextAreaState | null => {
  const element = ref.current;
  if (!element) return null;

  return {
    value: element.value,
    selectionStart: element.selectionStart ?? 0,
    selectionEnd: element.selectionEnd ?? 0,
  };
};

const getSelectedText = (ref: RefObject<HTMLTextAreaElement | null>): string | null => {
  const state = getTextAreaState(ref);
  if (!state) return null;

  const { value, selectionStart, selectionEnd } = state;
  return selectionStart !== selectionEnd ? value.slice(selectionStart, selectionEnd) : null;
};

const replaceSelectedText = (
  ref: RefObject<HTMLTextAreaElement | null>,
  newText: string
): boolean => {
  const element = ref.current;
  if (!element) return false;

  const state = getTextAreaState(ref);
  if (!state || state.selectionStart === state.selectionEnd) return false;

  const { value, selectionStart, selectionEnd } = state;
  const newValue = value.slice(0, selectionStart) + newText + value.slice(selectionEnd);


  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value')!.set!;
  nativeInputValueSetter.call(element, newValue);

  element.setSelectionRange(selectionStart, selectionStart + newText.length);

  element.dispatchEvent(new Event('change', { bubbles: true }));

  return true;
};

const wrapWithTag = (text: string | null, tag: string): string => {
  if (!text) return '';

  const lowerTag = tag.toLowerCase();
  const openTag = `<${lowerTag}>`;
  const closeTag = `</${lowerTag}>`;

  if (text.startsWith(openTag) && text.endsWith(closeTag)) {
    return text.slice(openTag.length, -closeTag.length);
  }

  return `${openTag}${text}${closeTag}`;
};

interface ToolbarButtonProps extends PropsWithChildren {
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton = ({
  shortcut,
  children,
  onClick,
  disabled = false
}: ToolbarButtonProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!shortcut || disabled) return;

    const [modifiers, key] = shortcut.split('+').map(s => s.trim().toLowerCase());
    const [mainMod, secondaryMod] = modifiers.split(/[\+\&]/);

    const ctrl = mainMod === 'ctrl' || secondaryMod === 'ctrl';
    const meta = mainMod === 'meta' || secondaryMod === 'meta';
    const shift = mainMod === 'shift' || secondaryMod === 'shift';
    const alt = mainMod === 'alt' || secondaryMod === 'alt';

    const correctCtrl = (ctrl && event.ctrlKey) || (!ctrl && !event.ctrlKey);
    const correctMeta = (meta && event.metaKey) || (!meta && !event.metaKey);
    const correctShift = (shift && event.shiftKey) || (!shift && !event.shiftKey);
    const correctAlt = (alt && event.altKey) || (!alt && !event.altKey);

    const matchesModifiers = correctCtrl && correctMeta && correctShift && correctAlt;
    const matchesKey = event.key.toLowerCase() === key;

    if (matchesModifiers && matchesKey) {
      event.preventDefault();
      onClick();
    }
  }, [shortcut, onClick, disabled]);

  useEffect(() => {
    if (!shortcut || disabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, handleKeyDown, disabled]);

  return (
    <IconButton
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${shortcut.replace('ctrl+', 'Ctrl+')}` : undefined}
    >
      {children}
    </IconButton>
  );
};

export default function EditorWindowToolbar({ textAreaRef }: EditorWindowToolbarProps) {

  const applyFormatting = useCallback((tag: string) => {
    const selectedText = getSelectedText(textAreaRef);
    if (!selectedText) return;

    const wrappedText = wrapWithTag(selectedText, tag);
    replaceSelectedText(textAreaRef, wrappedText);
  }, [textAreaRef]);


  return (
    <div className="w-full flex flex-row gap-2 border-b p-3 -mt-1 font-medium border-gray-200 bg-white">


      <ToolbarButton
        shortcut="ctrl+b"
        onClick={() => applyFormatting('b')}
      >
        <BoldIcon size={18} />
      </ToolbarButton>

      <ToolbarButton
        shortcut="ctrl+i"
        onClick={() => applyFormatting('i')}
      >
        <ItalicIcon size={18} />
      </ToolbarButton>

      <ToolbarButton
        shortcut="ctrl+u"
        onClick={() => applyFormatting('u')}
      >
        <UnderlineIcon size={18} />
      </ToolbarButton>
    </div>
  );
}
