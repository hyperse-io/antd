export const editorTemplates = {
  block: {
    title: '块级卡片',
    description: '块级卡片',
    content: `<div style="{$varStyle} background-color:var(--editor-card-bgcolor);padding: 5px 20px;border-radius: 2px;color:#555">
                <p>#自定义内容</p>
               </div><p></p>`,
  },
  primary_p: {
    title: 'primary_p',
    description: 'primary色调<p>',
    content:
      '<p style="{$varStyle}color:var(--fa-color-primary)">#自定义内容</p><p></p>',
  },
  secondary_p: {
    title: 'secondary_p',
    description: 'secondary色调<p>',
    content:
      '<p style="{$varStyle}color:var(--fa-color-secondary)">#自定义内容</p><p></p>',
  },
  warning_p: {
    title: 'warning_p',
    description: 'warning色调<p>',
    content:
      '<p style="{$varStyle}color:var(--fa-color-warning)">#自定义内容</p><p></p>',
  },
  danger_p: {
    title: 'danger_p',
    description: 'danger色调<p>',
    content:
      '<p style="{$varStyle}color:var(--fa-color-danger)">#自定义内容</p><p></p>',
  },
  success_p: {
    title: 'success_p',
    description: 'success色调<p>',
    content:
      '<p style="{$varStyle}color:var(--fa-color-success)">#自定义内容</p><p></p>',
  },
  p: {
    title: 'p',
    description: 'p',
    content: '<p></p>',
  },
};
