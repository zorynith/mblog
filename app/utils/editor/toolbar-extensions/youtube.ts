import type { AiEditor, CustomMenu } from "aieditor";

const YoutubeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M23.4985 6.58622C23.4985 6.58622 23.2605 4.8793 22.5318 4.14372C21.6165 3.19067 20.5933 3.18616 20.1224 3.13207C16.8392 2.88867 11.9987 2.88867 11.9987 2.88867H11.9913C11.9913 2.88867 7.15082 2.88867 3.86756 3.13207C3.39671 3.18616 2.37349 3.19067 1.45814 4.14372C0.729508 4.8793 0.491508 6.58622 0.491508 6.58622C0.491508 6.58622 0.248169 8.57485 0.248169 10.5585V12.4095C0.248169 14.3931 0.491508 16.3818 0.491508 16.3818C0.491508 16.3818 0.729508 18.0887 1.45814 18.8243C2.37349 19.7773 3.57945 19.7458 4.11645 19.8459C6.00445 20.0236 11.9949 20.0776 11.9949 20.0776C11.9949 20.0776 16.8392 20.0701 20.1224 19.8267C20.5933 19.7726 21.6165 19.7681 22.5318 18.815C23.2605 18.0795 23.4985 16.3726 23.4985 16.3726C23.4985 16.3726 23.7418 14.3839 23.7418 12.4004V10.5494C23.7418 8.56582 23.4985 6.58622 23.4985 6.58622Z" fill="#FF0000"/>
  <path d="M9.73047 15.0688V7.36877L16.2305 11.2238L9.73047 15.0688Z" fill="white"/>
</svg>`;

function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const youtubeButton: CustomMenu = {
  icon: YoutubeIcon,
  onClick: (event, editor) => {
    const url = prompt('input youtube url');
    if (url) {
      const youtubeId = extractYoutubeId(url);
      if (youtubeId) {
        editor.insert({
          type: "paragraph",
          content: [{
            type: "text",
            text: `%%youtube{${youtubeId}}%%`
          }]
        });
      } else {
        alert('invalid youtube url');
      }
    }
  },
  tip: "insert youtube video"
}; 
