import { Button, Typography } from 'antd';

export function ErrorFallback({ error }) {
  return (
    <div style={{ height: '100%', padding: '8px' }}>
      <div
        style={{
          backgroundColor: '#fff',
          height: '100%',
          padding: '0 8px 8px 8px',
          overflow: 'hidden',
        }}
      >
        <Typography.Title level={2}>Something went wrong</Typography.Title>
        <Typography.Paragraph>{error.message}</Typography.Paragraph>
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
