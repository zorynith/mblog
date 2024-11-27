import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { Link as tiptapLlink } from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Youtube from "@tiptap/extension-youtube";
import { Node, mergeAttributes } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Gapcursor from '@tiptap/extension-gapcursor'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'

// 添加自定义 Video 扩展
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: null,
      },
      controls: {
        default: true,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)]
  },
})

// 自定义 Heading 扩展
const CustomHeading = Heading.configure({
  levels: [1, 2, 3],
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            id: attributes.id,
          };
        },
      },
    };
  },
});

export async function generateHTML_by_tiptap(randercontent: any) {
  let html = generateHTML(randercontent, [
    StarterKit.configure({
      heading: false,
    }),
    CustomHeading,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Table,
    TableCell,
    TableHeader,
    TableRow,
    TextStyle,
    Image,
    tiptapLlink,
    Highlight,
    Subscript,
    Superscript,
    Underline,
    TaskItem,
    TaskList,
    Youtube,
    Video,
  ]);


    // 然后替换特殊格式的文本为 YouTube iframe
    html = html.replace(/%%youtube{([^}]+)}%%/g, (match, youtubeId) => {
      return `<iframe 
        width="640" 
        height="360" 
        src="https://www.youtube.com/embed/${youtubeId}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>`;
    });

      // 处理 Bilibili 嵌入
  html = html.replace(/%%bilibili{([^}]+)}%%/g, (match, params) => {
    return `<iframe 
      width="640" 
      height="360" 
      src="//player.bilibili.com/player.html?${params}&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>`;
  });

    return html;


}
