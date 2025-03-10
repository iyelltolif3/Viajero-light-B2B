import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Voucher } from '@/types';

interface VoucherQRProps {
  voucher: Voucher;
  className?: string;
}

export default function VoucherQR({ voucher, className }: VoucherQRProps) {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Crear el contenido del QR con la información relevante del voucher
    const qrData = {
      id: voucher.id,
      planId: voucher.planId,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      travelers: voucher.travelers.map(t => ({
        name: t.name,
        passport: t.passport
      })),
      status: voucher.status,
      emergencyContact: voucher.emergencyContact
    };

    setQrValue(JSON.stringify(qrData));
  }, [voucher]);

  const handleDownload = () => {
    const canvas = document.getElementById('voucher-qr') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `voucher-${voucher.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Código QR del Voucher</CardTitle>
        <CardDescription>
          Escanea este código para acceder a los detalles de tu asistencia
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCode
            id="voucher-qr"
            value={qrValue}
            size={200}
            level="H"
            includeMargin
            renderAs="canvas"
          />
        </div>
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Descargar QR
        </Button>
      </CardContent>
    </Card>
  );
} 