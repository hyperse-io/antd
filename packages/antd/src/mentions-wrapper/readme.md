MentionWrapper

```jsx
const [value, setValue] = useState<string>();
<MentionsWrapper
  value={value}
  placeholder='请输入'
  onChange={setValue.bind(null)}
  onCursorChange={(position) => {
    console.log('onCursorChange', position);
  }}
/>
```

MetionEditor

```jsx
<MetionEditor
  value={value}
  onSelectParam={onAddParams}
  onChange={setValue}
  prefix={'$'}
  operations={[
    {
      type: 'text',
      codePrefix: '_text',
      label: '文本参数',
      icon: <FieldStringOutlined />,
      codeAdapter: () => {
        return '_text' + index.current++;
      },
    },
    {
      type: 'number',
      codePrefix: '_number',
      label: '数字参数',
      icon: <NumberOutlined />,
    },
    {
      type: 'link',
      codePrefix: '_link',
      label: '链接参数',
      icon: <LinkOutlined />,
    },
  ]}
  params={params}
/>
```
