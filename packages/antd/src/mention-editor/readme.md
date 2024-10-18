MetionEditor

```jsx
const index = useRef(0)
const [value, setValue] = useState<string>();
const [params, setParams] = useState<ParamItem[]>([
  { code: '${_var0}', type: 'text', value: '111' },
  { code: '${_var1}', type: 'text', value: '222' },
])

const onAddParams = (item, prefix) => {
  setParams(preParams => [
    ...preParams,
    item
  ])
}

return <MetionEditor
  value={value}
  onSelectParam={onAddParams}
  onChange={setValue}
  prefix={'$'}
  operations={[
    {
      type: 'text', codePrefix: '_text', label: "文本参数", icon: <FieldStringOutlined />, codeAdapter: () => {
        return '_text' + index.current++;
      }
    },
    { type: 'number', codePrefix: '_number', label: "数字参数", icon: <NumberOutlined /> },
    { type: 'link', codePrefix: '_link', label: "链接参数", icon: <LinkOutlined /> },
  ]}
  params={params}
/>
```
