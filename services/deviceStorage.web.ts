import {ApiError, Device, request} from './calendar';

export async function loadDevice(signal: AbortSignal): Promise<Device | null> {
  try {
    return await request<Device>('/api/display/session', signal);
  } catch (error) {
    if (error instanceof ApiError && error.code === 'UNAUTHORIZED') return null;
    throw error;
  }
}

export async function saveDevice(
  device: Device,
  signal: AbortSignal,
): Promise<Device> {
  await request<Device>(
    '/api/display/session',
    signal,
    device.deviceCredential,
    {
      deviceId: device.deviceId,
    },
  );
  // Confirm the browser accepted the cookie before discarding the bearer credential.
  const restored = await loadDevice(signal);
  if (!restored)
    throw new Error(
      'Could not remember this display. Allow cookies and retry pairing.',
    );
  return restored;
}

export async function clearDevice(): Promise<void> {
  // The backend expires the HttpOnly cookie when it rejects a revoked device.
}
