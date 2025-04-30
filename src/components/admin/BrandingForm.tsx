import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AdminSettings } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Upload } from 'lucide-react';
import { LogoUploader } from '@/components/ui/logo-uploader';

interface BrandingFormProps {
  settings: AdminSettings;
  updateSettings: (updates: Partial<AdminSettings>) => void;
}

// Importamos la función de navegación para refrescar la página
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

export function BrandingForm({ settings, updateSettings }: BrandingFormProps) {
  // Para refrescar la página
  const navigate = useNavigate();
  // Obtenemos la función saveSettings directamente del store
  const { saveSettings } = useSettingsStore();
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
    if (settings) {
      // Asegurarnos de que tenemos valores válidos independientemente de la estructura
      // Esto resuelve problemas con valores null y proporciona fallbacks
      
      // Obtener valores de ambas posibles fuentes (branding object o propiedades directas)
      const brandingValues = settings.branding || {};
      
      setFormValues({
        companyName: (brandingValues as any)?.companyName || settings.brandName || '',
        contactEmail: (brandingValues as any)?.contactEmail || '',
        supportPhone: (brandingValues as any)?.supportPhone || '',
        logo: (brandingValues as any)?.logo || settings.brandLogo || '',
        primaryColor: (brandingValues as any)?.primaryColor || settings.primaryColor || '#0f172a',
        secondaryColor: (brandingValues as any)?.secondaryColor || settings.secondaryColor || '#64748b',
      });
      
      // Log para depuración
      console.log('Valores inicializados:', { 
        formValues: {
          companyName: (brandingValues as any)?.companyName || settings.brandName || '',
          logo: (brandingValues as any)?.logo || settings.brandLogo || ''
        },
        branding: settings.branding,
        brandName: settings.brandName,
        brandLogo: settings.brandLogo
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

  // Handle file upload from LogoUploader - Optimizado para solo usar base64
  const handleLogoChange = async (logoFile: File | string) => {
    // Si recibimos una URL string (desde una inicialización o reset), simplemente actualizar
    if (typeof logoFile === 'string') {
      updateFormValue('logo', logoFile);
      return;
    }
    
    try {
      setUploading(true);
      
      // Convertir directamente el archivo a base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoFile);
      });
      
      const base64Data = await base64Promise;
      
      // Guardar el base64 directamente - solución sencilla y eficaz
      updateFormValue('logo', base64Data);
      
      toast({
        title: "Imagen guardada",
        description: "La imagen se ha guardado correctamente en formato local."
      });
    } catch (error: any) {
      console.error('Error al procesar la imagen:', error);
      toast({
        title: "Error al procesar la imagen",
        description: error.message || "No se pudo procesar la imagen.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
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
  const saveChanges = async () => {
    // IMPORTANTE: Al guardar, debemos preservar la estructura exacta que espera Supabase
    if (!settings) return;
    
    try {
      // Crear una copia del settings actual
      const updatedSettings = { ...settings };
      
      // Eliminar propiedades antiguas a nivel raíz si existen
      delete updatedSettings.brandName;
      delete updatedSettings.brandLogo;
      delete updatedSettings.primaryColor;
      delete updatedSettings.secondaryColor;
      delete updatedSettings.tertiaryColor;
      
      // Asegurarnos que branding existe
      if (!updatedSettings.branding) {
        updatedSettings.branding = {
          logo: '',
          companyName: '',
          contactEmail: '',
          supportPhone: '',
          primaryColor: '#0f172a',
          secondaryColor: '#64748b'
        };
      }
      
      // Actualizar solo los campos de branding
      updatedSettings.branding = {
        ...updatedSettings.branding,
        companyName: formValues.companyName,
        contactEmail: formValues.contactEmail,
        supportPhone: formValues.supportPhone,
        logo: formValues.logo,
        primaryColor: formValues.primaryColor,
        secondaryColor: formValues.secondaryColor
      };
      
      // Log para debuguear
      console.log('Guardando configuración actualizada:', updatedSettings);
      
      // 1. Primero actualizar los settings locales
      updateSettings(updatedSettings);
      
      // 2. Luego guardar en Supabase directamente
      await saveSettings();
      
      toast({
        title: "Cambios guardados",
        description: "La configuración de marca ha sido actualizada. Refrescando página..."
      });
      
      // 3. Refrescar la página después de un breve momento
      setTimeout(() => {
        navigate(0); // Esto refrescará la página actual
      }, 1500);
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    }
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
              {/* Eliminamos el input del URL del logo que mostraba cadenas base64 muy largas */}
              {!formValues.logo || formValues.logo.startsWith('http') ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    value={formValues.logo || ''}
                    onChange={(e) => updateFormValue('logo', e.target.value)}
                    placeholder="URL del logo o sube una imagen"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-2">
                  La imagen será subida al guardar la configuración
                </div>
              )}
              
              {/* Usar LogoUploader en lugar del input/button */}
              <div className="mt-2">
                {/* Import LogoUploader desde components/ui */}
                {/* Pasamos el logo actual y la función de manejo */}
                <LogoUploader
                  currentLogo={formValues.logo}
                  onLogoChange={handleLogoChange}
                />
              </div>
              
              {/* Vista previa del logo */}
              {formValues.logo && !formValues.logo.startsWith('data:') && (
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
