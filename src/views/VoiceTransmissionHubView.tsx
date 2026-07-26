import React from 'react';
import { TransmissionPage } from '../pages/TransmissionPage';

interface VoiceTransmissionHubViewProps {
  onStartLiveRecording?: () => void;
}

export const VoiceTransmissionHubView: React.FC<VoiceTransmissionHubViewProps> = () => {
  return <TransmissionPage />;
};
