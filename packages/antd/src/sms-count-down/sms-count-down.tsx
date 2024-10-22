import { type FC, useEffect, useMemo, useState } from 'react';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';

export interface SmsCountDownProps {
  onSendRequest: () => Promise<void>; // 验证码请求函数
  totalTicks?: number; // 总倒计时，默认：60(s)
  duration?: number; // 倒计时间隔，默认：1000ms(1s)
  autoStart?: boolean; // 是否自动开始倒计时，默认：fasle，注意：不会自动调用 onSendRequest
  format?: string; // 倒计时格式化，默认：'{t}s'
  sendTxt?: string; // 文案，默认：'获取验证码'
  sentTxt?: string; // 倒计时完成文案，默认：'重新获取'
  processingTxt?: string; // 倒计时中文案，默认：'发送中...'
  onTick?: (time: number) => void; // 倒计时回调
  className?: string;
}
export const SmsCountDown: FC<SmsCountDownProps> = (props) => {
  const [showMessage, setShowMessage] = useState<string>();

  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);

  // 初始化设置有效
  const initConfig = useMemo<
    Omit<SmsCountDownProps, 'onSendRequest' | 'onTick' | 'className'>
  >(() => {
    return {
      sendTxt: props.sendTxt,
      sentTxt: props.sentTxt,
      processingTxt: props.processingTxt,
      format: props.format,
      autoStart: props.autoStart,
      totalTicks: props.totalTicks,
      duration: props.duration,
    };
  }, []);

  const format = initConfig.format as string;
  const totalTicks = initConfig.totalTicks as number;
  const duration = initConfig.duration as number;

  const countdownFnc = hooks.useCountdownCallback(
    (num) => {
      const second = num / 1000;
      if (num > 0) {
        if (!running) {
          setRunning(true);
        }
        setShowMessage(format.replace('{t}', String(second)));
        props.onTick?.(second);
      } else if (num === 0) {
        setRunning(false);
        setStarting(false);
        props.onTick?.(second);
        setShowMessage(initConfig.sentTxt);
      }
    },
    totalTicks * 1000,
    { intervalTime: duration }
  );

  useEffect(() => {
    if (!initConfig.autoStart) {
      setShowMessage(initConfig.sendTxt);
    } else {
      countdownFnc();
      setStarting(true);
      setRunning(true);
    }
  }, [countdownFnc, initConfig]);

  const onStart = hooks.useCallbackRef(() => {
    if (running || starting) return;
    setStarting(true);
    setShowMessage(initConfig.processingTxt);
    void props
      .onSendRequest()
      .then(() => {
        setRunning(true);
        countdownFnc();
      })
      .catch(() => {
        setShowMessage(initConfig.sendTxt);
        setStarting(false);
      });
  });

  const className = classNames('v-count-down', props.className, {
    running,
    starting,
  });

  return (
    <div className={className} onClick={onStart}>
      {showMessage}
    </div>
  );
};

SmsCountDown.defaultProps = {
  totalTicks: 60,
  duration: 1000,
  autoStart: false,
  format: '{t}s',
  sendTxt: '获取验证码',
  sentTxt: '重新获取',
  processingTxt: '发送中...',
};
