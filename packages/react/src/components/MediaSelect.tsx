import React, { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { useMaybeRoomContext } from './LiveKitRoom';
import { setupMediaSelect } from '@livekit/components-core';
import { mergeProps } from 'react-aria';

type MediaSelectProps = React.HTMLAttributes<HTMLSelectElement> & {
  kind: MediaDeviceKind;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  onDevicesChange?: (devices: MediaDeviceInfo[]) => void;
};

export const useMediaSelect = (props: MediaSelectProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const room = useMaybeRoomContext();

  const onChange: ChangeEventHandler<HTMLSelectElement> = useCallback(async (evt) => {
    await room?.switchActiveDevice(props.kind, evt.target.value);
    if (props.onChange) {
      props.onChange(evt);
    }
  }, []);
  // TODO figure out and return initial/current device

  const handleDevicesChanged = (newDevices: MediaDeviceInfo[]) => {
    setDevices(newDevices);

    props.onDevicesChange?.(newDevices);
  };

  const { className, deviceListener } = setupMediaSelect();

  const newProps = mergeProps(props, { className });

  useEffect(() => deviceListener(props.kind, handleDevicesChanged));

  return { devices, selectProps: { ...newProps, onChange } };
};

export const MediaSelect = (props: MediaSelectProps) => {
  const { devices, selectProps } = useMediaSelect(props);

  return (
    <select {...selectProps}>
      {devices.map((d) => (
        <option value={d.deviceId} key={d.deviceId}>
          {d.label}
        </option>
      ))}
    </select>
  );
};
