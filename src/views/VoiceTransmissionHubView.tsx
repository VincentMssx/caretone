import React from 'react';
import { TransmissionPage } from '../pages/TransmissionPage';
import { Patient } from '../types';

interface VoiceTransmissionHubViewProps {
  onStartLiveRecording?: () => void;
  onInspectPatient?: (patient: Patient) => void;
}

export const VoiceTransmissionHubView: React.FC<VoiceTransmissionHubViewProps> = ({
  onStartLiveRecording,
  onInspectPatient
}) => {
  return (
    <TransmissionPage
      onInspectPatient={onInspectPatient}
      onStartLiveRecording={onStartLiveRecording}
    />
  );
};
