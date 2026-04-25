import AsyncStorage from '@react-native-async-storage/async-storage';

let _cached: string | null = null;

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  if (_cached) return _cached;
  try {
    let id = await AsyncStorage.getItem('device_id');
    if (!id) {
      id = uuidv4();
      await AsyncStorage.setItem('device_id', id);
    }
    _cached = id;
    return id;
  } catch {
    return uuidv4();
  }
}
