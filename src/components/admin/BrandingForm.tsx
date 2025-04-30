import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AdminSettings } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload } from 'lucide-react';

interface BrandingFormProps {
  settings: AdminSettings;
  updateSettings: (updates: Partial<AdminSettings>) => void;
}

export function BrandingForm({ settings, updateSettings }: BrandingFormProps) {
  const [formValues, setFormValues] = useState({
    companyName: '',
    contactEmail: '',
    supportPhone: '',
    logo: '',
    primaryColor: '#0f172a',
    secondaryColor: '#64748b',
  });
  
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form values when settings change
  useEffect(() => {
    if (settings?.branding) {
      setFormValues({
        companyName: settings.branding.companyName || '',
        contactEmail: settings.branding.contactEmail || '',
        supportPhone: settings.branding.supportPhone || '',
        logo: settings.branding.logo || '',
        primaryColor: settings.branding.primaryColor || '#0f172a',
        secondaryColor: settings.branding.secondaryColor || '#64748b',
      });
    }
  }, [settings]);

  // Update a single form value
  const updateFormValue = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle logo image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('brand_assets')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand_assets')
        .getPublicUrl(filePath);
      
      // Update form with the new URL
      updateFormValue('logo', publicUrl);
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save all changes to the settings store
  const saveChanges = () => {
    updateSettings({
      ...settings,
      branding: {
        ...settings.branding,
        ...formValues
      }
    });
    
    toast({
      title: "Cambios guardados",
      description: "La configuración de marca ha sido actualizada."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marca</CardTitle>
        <CardDescription>
          Configura la apariencia de tu marca
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input
              id="company-name"
              value={formValues.companyName}
              onChange={(e) => updateFormValue('companyName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contact-email">Email de Contacto</Label>
            <Input
              id="contact-email"
              type="email"
              value={formValues.contactEmail}
              onChange={(e) => updateFormValue('contactEmail', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="support-phone">Teléfono de Soporte</Label>
            <Input
              id="support-phone"
              value={formValues.supportPhone}
              onChange={(e) => updateFormValue('supportPhone', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="logo">Logo</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  id="logo"
                  value={formValues.logo}
                  onChange={(e) => updateFormValue('logo', e.target.value)}
                  placeholder="URL del logo o sube una imagen"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              {formValues.logo && (
                <div className="mt-2">
                  <img 
                    src={formValues.logo} 
                    alt="Logo de la empresa" 
                    className="h-16 object-contain rounded-md border border-border"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="primary-color">Color Primario</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primary-color"
                type="color"
                className="w-16 h-10"
                value={formValues.primaryColor}
                onChange={(e) => updateFormValue('primaryColor', e.target.value)}
              />
              <Input 
                value={formValues.primaryColor}
                onChange={(e) => updateFormValue('primaryColor', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="secondary-color">Color Secundario</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondary-color"
                type="color"
                className="w-16 h-10"
                value={formValues.secondaryColor}
                onChange={(e) => updateFormValue('secondaryColor', e.target.value)}
              />
              <Input 
                value={formValues.secondaryColor}
                onChange={(e) => updateFormValue('secondaryColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveChanges}>Guardar Cambios</Button>
      </CardFooter>
    </Card>
  );
}
