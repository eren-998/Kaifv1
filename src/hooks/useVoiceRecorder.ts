import { useState, useEffect, useRef } from 'react';

type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';
type RecordingStatus = 'idle' | 'recording' | 'stopped';

export const useVoiceRecorder = () => {
  const [permission, setPermission] = useState<PermissionStatus>('idle');
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Check initial permission status
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermission(permissionStatus.state as PermissionStatus);
        }
      } catch (error) {
        console.error("Could not query microphone permission:", error);
        setPermission('denied'); // Assume denied if query fails
      }
    };
    checkPermission();
  }, []);

  const getMicrophonePermission = async () => {
    if (!('MediaRecorder' in window)) {
      alert('The MediaRecorder API is not supported in your browser.');
      setPermission('denied');
      throw new Error('MediaRecorder not supported');
    }

    try {
      setPermission('pending');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission('granted');
      return stream;
    } catch (err: any) {
      // This is an expected user action, not a critical application error.
      // We still throw the error so the UI component can react (e.g., show a modal),
      // but we avoid logging it as a red "error" in the console.
      if (err.name === 'NotAllowedError') {
        console.log('Microphone permission was denied by the user.');
      } else {
        console.error('An unexpected error occurred while getting microphone permission:', err);
      }
      setPermission('denied');
      throw err; // Re-throw the error to be caught by the calling component.
    }
  };

  const startRecording = async () => {
    let stream = streamRef.current;
    if (permission !== 'granted' || !stream) {
      // This will throw an error if permission is denied, which is caught in ChatInput.tsx
      stream = await getMicrophonePermission();
    }

    setRecordingStatus('recording');
    setRecordingTime(0);
    audioChunksRef.current = [];

    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      setRecordingStatus('stopped');
      audioChunksRef.current = [];
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
    
    mediaRecorderRef.current.start();

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setRecordingStatus('idle');
  };
  
  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return {
    permission,
    recordingStatus,
    startRecording,
    stopRecording,
    clearRecording,
    audioBlob,
    recordingTime,
  };
};
