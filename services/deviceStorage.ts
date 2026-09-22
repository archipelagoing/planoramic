import * as SecureStore from 'expo-secure-store';
import {API_URL, Device} from './calendar';

const key = `planoramic.device.${Array.from(API_URL)
  .map(char => char.charCodeAt(0).toString(16).padStart(4, '0'))
  .join('')}`;

export async function loadDevice(_signal: AbortSignal): Promise<Device | null> {
  const stored = await SecureStore.getItemAsync(key);
  if (!stored) return null;
  try {
    const device = JSON.parse(stored);
    if (
      typeof device.deviceId === 'string' &&
      device.deviceId &&
      typeof device.deviceCredential === 'string' &&
      device.deviceCredential
    ) {
      return device;
    }
  } catch {}
  await clearDevice();
  return null;
}

export async function saveDevice(
  device: Device,
  _signal: AbortSignal,
): Promise<Device> {
  await SecureStore.setItemAsync(key, JSON.stringify(device));
  return device;
}

export async function clearDevice(): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
