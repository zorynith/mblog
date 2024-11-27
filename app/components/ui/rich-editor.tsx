import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List } from "lucide-react";
import { Button } from "./button";
import { cn } from "~/lib/utils";

interface RichEditorProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxHeight?: number;
}

export function RichEditor({
  defaultValue = "",
  onChange,
  placeholder,
  className,
  maxHeight = 300,
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert focus:outline-none',
          'min-h-[100px] px-3 py-2',
          'overflow-y-auto',
        ),
        style: `max-height: ${maxHeight}px`,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className={cn(
      "w-full rounded-md border flex flex-col",
      className
    )}>
      <div className="border-b p-1 flex gap-1 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBold().run())}
          className={cn(editor.isActive('bold') && 'bg-muted')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
          className={cn(editor.isActive('italic') && 'bg-muted')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
          className={cn(editor.isActive('bulletList') && 'bg-muted')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow overflow-auto">
        <EditorContent 
          editor={editor}
          className="h-full"
        />
      </div>
    </div>
  );
} 