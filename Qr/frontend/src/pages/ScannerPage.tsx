// Página de escáner QR con cámara y registro de accesos
import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { ScanResult } from '@/types';
import { useDoors } from '@/hooks/useDoors';
import { accessService } from '@/services/access';

const SCANNER_ID = 'qr-reader';

interface ScanState {
  success: boolean;
  tipo?: 'entrada' | 'salida';
  personName?: string;
  personTipo?: string;
  doorName?: string;
  message: string;
  timestamp?: string;
}

export function ScannerPage() {
  // Ref para el valor actual de la puerta seleccionada — evita stale closure en el callback del scanner
  const selectedDoorIdRef = useRef<string>('');
  const isProcessingRef = useRef(false);

  const [selectedDoorId, setSelectedDoorId] = useState('');
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [cameraError, setCameraError] = useState('');

  const { data: doors = [] } = useDoors();

  function handleDoorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedDoorId(id);
    selectedDoorIdRef.current = id;
  }

  const handleQrCode = useCallback(async (decodedText: string) => {
    const doorId = selectedDoorIdRef.current;
    // No procesar si ya hay un escaneo en curso o no hay puerta seleccionada
    if (isProcessingRef.current || !doorId) return;
    isProcessingRef.current = true;

    try {
      const { data } = await accessService.scan({ qr_token: decodedText, door_id: doorId });
      const res = data as ScanResult;
      setScanState({
        success: true,
        tipo: res.tipo,
        personName: res.person.nombre,
        personTipo: res.person.tipo,
        doorName: res.door.nombre,
        message: res.tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada',
        timestamp: res.timestamp,
      });
    } catch (err) {
      let message = 'Error desconocido';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      setScanState({ success: false, message });
    } finally {
      // Bloquear nuevos escaneos durante 3 segundos mientras se muestra el resultado
      setTimeout(() => {
        setScanState(null);
        isProcessingRef.current = false;
      }, 3000);
    }
  }, []);

  // Iniciar el scanner al montar el componente
  useEffect(() => {
    const qrScanner = new Html5Qrcode(SCANNER_ID);

    qrScanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleQrCode,
        () => {}, // ignorar errores por frame (QR no visible)
      )
      .catch(() => {
        setCameraError(
          'No se pudo acceder a la cámara. Verifica los permisos del navegador.',
        );
      });

    return () => {
      qrScanner.stop().catch(() => {});
    };
  }, [handleQrCode]);

  return (
    <div className="p-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-5 h-5 text-accent" />
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Escáner QR</h1>
          <p className="text-text-secondary text-xs mt-0.5">
            Apunta la cámara al código QR para registrar el acceso
          </p>
        </div>
      </div>

      {/* Selector de puerta */}
      <div className="card mb-4">
        <label className="block text-text-secondary text-xs mb-1.5">Puerta de acceso</label>
        <select
          value={selectedDoorId}
          onChange={handleDoorChange}
          className="input-base"
        >
          <option value="">— Selecciona una puerta —</option>
          {doors.map((door) => (
            <option key={door.id} value={door.id}>
              {door.nombre} · {door.ubicacion}
            </option>
          ))}
        </select>
        {!selectedDoorId && (
          <p className="text-warning text-xs mt-2 flex items-center gap-1">
            ⚠ Selecciona una puerta para habilitar el escaneo.
          </p>
        )}
      </div>

      {/* Área de cámara */}
      <div className="card p-0 overflow-hidden relative">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
            <CameraOff className="w-10 h-10 text-error" />
            <p className="text-error text-sm text-center">{cameraError}</p>
            <p className="text-text-secondary text-xs text-center">
              Asegúrate de que el sitio tiene permiso para acceder a la cámara en la
              configuración de tu navegador.
            </p>
          </div>
        ) : (
          <>
            {/* El scanner de html5-qrcode inyecta el video aquí */}
            <div id={SCANNER_ID} className="w-full" />

            {/* Overlay de resultado — cubre el video durante 3 segundos */}
            {scanState && (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm ${
                  scanState.success ? 'bg-bg-primary/80' : 'bg-bg-primary/80'
                }`}
              >
                {scanState.success ? (
                  <CheckCircle className="w-14 h-14 text-success" />
                ) : (
                  <XCircle className="w-14 h-14 text-error" />
                )}

                {scanState.success && scanState.tipo && (
                  <span
                    className={`badge text-sm px-3 py-1 ${
                      scanState.tipo === 'entrada'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {scanState.tipo.toUpperCase()}
                  </span>
                )}

                <p
                  className={`text-xl font-semibold ${
                    scanState.success ? 'text-text-primary' : 'text-error'
                  }`}
                >
                  {scanState.success ? scanState.personName : scanState.message}
                </p>

                {scanState.success && scanState.personTipo && (
                  <p className="text-text-secondary text-sm capitalize">{scanState.personTipo}</p>
                )}

                {scanState.success && scanState.doorName && (
                  <p className="text-text-secondary text-xs">{scanState.doorName}</p>
                )}

                {scanState.timestamp && (
                  <p className="text-text-secondary text-xs">
                    {new Date(scanState.timestamp).toLocaleTimeString('es', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Indicador de puerta no seleccionada */}
            {!selectedDoorId && !scanState && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/70 backdrop-blur-sm">
                <p className="text-warning text-sm font-medium">
                  Selecciona una puerta para escanear
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
