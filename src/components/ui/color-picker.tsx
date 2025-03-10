import { Input } from './input';
import { Label } from './label';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-20 p-1"
      />
      <Input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1"
      />
    </div>
  );
} 