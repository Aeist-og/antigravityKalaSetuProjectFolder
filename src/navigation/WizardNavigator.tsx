import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useProductDraft } from '../context/ProductDraftContext';
import { RootStackParamList } from './types';

// Step Screens
import { Step1AddProductScreen } from '../screens/wizard/Step1AddProductScreen';
import { Step2ImageStudioScreen } from '../screens/wizard/Step2ImageStudioScreen';
import { Step3DescribeProductScreen } from '../screens/wizard/Step3DescribeProductScreen';
import { Step4ReviewProductScreen } from '../screens/wizard/Step4ReviewProductScreen';
import { Step5MissingInfoScreen } from '../screens/wizard/Step5MissingInfoScreen';
import { Step6SmartPricingScreen } from '../screens/wizard/Step6SmartPricingScreen';
import { Step7TemplateSelectScreen } from '../screens/wizard/Step7TemplateSelectScreen';
import { Step8CataloguePreviewScreen } from '../screens/wizard/Step8CataloguePreviewScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductWizard'>;

export const WizardNavigator: React.FC<Props> = ({ navigation }) => {
  const { currentStep, setCurrentStep, nextStep, prevStep } = useProductDraft();

  const handleFinish = () => {
    navigation.navigate('ArtisanApp', { screen: 'Home' });
  };

  const handleBackToHome = () => {
    navigation.navigate('ArtisanApp', { screen: 'Home' });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1AddProductScreen
            onBack={handleBackToHome}
            onNext={nextStep}
          />
        );
      case 2:
        return <Step2ImageStudioScreen onBack={prevStep} onNext={nextStep} />;
      case 3:
        return <Step3DescribeProductScreen onBack={prevStep} onNext={nextStep} />;
      case 4:
        return <Step4ReviewProductScreen onBack={prevStep} onNext={nextStep} />;
      case 5:
        return <Step5MissingInfoScreen onBack={prevStep} onNext={nextStep} />;
      case 6:
        return <Step6SmartPricingScreen onBack={prevStep} onNext={nextStep} />;
      case 7:
        return <Step7TemplateSelectScreen onBack={prevStep} onNext={nextStep} />;
      case 8:
        return (
          <Step8CataloguePreviewScreen
            onBack={prevStep}
            onJumpToStep={step => setCurrentStep(step)}
            onFinish={handleFinish}
          />
        );
      default:
        return (
          <Step1AddProductScreen
            onBack={handleBackToHome}
            onNext={nextStep}
          />
        );
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
