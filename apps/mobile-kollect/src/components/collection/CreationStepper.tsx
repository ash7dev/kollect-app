import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../app/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type Step = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  component: React.ReactNode;
};

type StepperProps = {
  currentStep: number;
  steps: Step[];
  onStepChange?: (step: number) => void;
};

export const CreationStepper = ({ 
  currentStep, 
  steps,
  onStepChange 
}: StepperProps) => {
  const { theme, isDark } = useTheme();
  
  const handleStepPress = (index: number) => {
    if (onStepChange && index < steps.length && index <= currentStep) {
      onStepChange(index);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header du stepper BOOM */}
      <View 
        style={[
          styles.stepperContainer, 
          { 
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.borderLight,
            borderBottomWidth: 1,
            // BOOM: Ombre subtile
            shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.6,
            shadowRadius: 6,
            elevation: 3,
          }
        ]}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.key}>
              <TouchableOpacity 
                style={styles.stepContainer}
                onPress={() => handleStepPress(index)}
                activeOpacity={0.7}
                disabled={index > currentStep}
              >
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor: isActive || isCompleted
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderWidth: isActive || isCompleted ? 0 : 2,
                      borderColor: theme.colors.borderLight,
                      // BOOM: Ombre forte sur icône active
                      shadowColor: isActive 
                        ? theme.colors.primary 
                        : 'transparent',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: isActive ? 0.4 : 0,
                      shadowRadius: 8,
                      elevation: isActive ? 4 : 0,
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  ) : (
                    <Ionicons 
                      name={step.icon} 
                      size={20} 
                      color={isActive || isCompleted 
                        ? '#FFFFFF' 
                        : theme.colors.textDisabled
                      } 
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    { 
                      color: isActive || isCompleted
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                      letterSpacing: isActive ? -0.2 : 0,
                    },
                  ]}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted
                        ? theme.colors.primary
                        : theme.colors.borderLight,
                      height: isCompleted ? 3 : 2,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Contenu de l'étape active */}
      <View style={styles.contentContainer}>
        {steps[currentStep]?.component}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  stepContainer: {
    alignItems: 'center',
    width: 80,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  connector: {
    flex: 1,
    marginHorizontal: 4,
  },
  contentContainer: {
    flex: 1,
  },
});