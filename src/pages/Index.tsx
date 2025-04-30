import HeroSection from '@/components/HeroSection';
import DiscountSection from '@/components/DiscountSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Discount Section */}
      <DiscountSection />
    </div>
  );
};

export default Index;
