import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Table as TableIcon,
  Image as ImageIcon, Minus, Undo, Redo,
} from 'lucide-react';

const TEMPLATE_VARIABLES = [
  { label: 'Nome do Motorista', value: '{{nome_motorista}}' },
  { label: 'CPF', value: '{{cpf_motorista}}' },
  { label: 'CNH', value: '{{cnh_motorista}}' },
  { label: 'Telefone', value: '{{telefone_motorista}}' },
  { label: 'E-mail', value: '{{email_motorista}}' },
  { label: 'Endereço Completo', value: '{{endereco_completo}}' },
  { label: 'Placa', value: '{{placa}}' },
  { label: 'Código do Veículo', value: '{{vehicle_code}}' },
  { label: 'Marca', value: '{{marca}}' },
  { label: 'Modelo', value: '{{modelo}}' },
  { label: 'Valor Semanal', value: '{{valor_semanal}}' },
  { label: 'Valor Caução', value: '{{valor_caucao}}' },
  { label: 'Valor Total', value: '{{valor_total}}' },
  { label: 'Data de Início', value: '{{data_inicio}}' },
  { label: 'Data de Fim', value: '{{data_fim}}' },
  { label: 'Data/Hora Envio', value: '{{data_hora_envio}}' },
  { label: 'Data Atual', value: '{{data_atual}}' },
];

interface MenuBarProps {
  editor: Editor | null;
}

function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `h-8 w-8 p-0 ${active ? 'bg-accent text-accent-foreground' : ''}`;

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={btnClass(editor.isActive({ textAlign: 'right' }))} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <TableIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => {
        const url = window.prompt('URL da imagem:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }}>
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ContractEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function ContractEditor({ content, onChange }: ContractEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image,
      Placeholder.configure({ placeholder: 'Comece a digitar o contrato...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes (e.g. when loading from DB) into the editor
  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      const currentHTML = editor.getHTML();
      // Only update if content is meaningfully different (avoid cursor reset)
      if (currentHTML !== content && content !== '<p></p>') {
        editor.commands.setContent(content, false);
      }
    }
  }, [editor, content]);

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
    }
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card">
        <MenuBar editor={editor} />
        <div className="flex-1 overflow-auto p-4">
          <EditorContent
            editor={editor}
            className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_u]:underline [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-muted [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6"
          />
        </div>
      </div>

      <div className="w-56 shrink-0">
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">Variáveis Dinâmicas</h3>
            <p className="text-xs text-muted-foreground mt-1">Clique para inserir no editor</p>
          </div>
          <ScrollArea className="h-[450px]">
            <div className="p-2 space-y-1">
              {TEMPLATE_VARIABLES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => insertVariable(v.value)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="font-medium">{v.label}</div>
                  <div className="text-xs text-muted-foreground">{v.value}</div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
