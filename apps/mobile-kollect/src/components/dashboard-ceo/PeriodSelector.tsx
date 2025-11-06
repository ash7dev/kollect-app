import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  Modal,
  TouchableWithoutFeedback 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Period {
  value: string;
  label: string;
}

interface PeriodSelectorProps {
  period: string;
  onChange: (value: string) => void;
}

const PERIODS: Period[] = [
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: '30 derniers jours' },
  { value: '90days', label: '90 derniers jours' },
  { value: 'year', label: 'Cette année' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  period, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedPeriod = PERIODS.find(p => p.value === period);

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsOpen(true)} 
        style={styles.selector}
      >
        <Text style={styles.selectorText}>{selectedPeriod?.label}</Text>
        <Ionicons name="chevron-down" size={16} color="#374151" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => {
                      onChange(p.value);
                      setIsOpen(false);
                    }}
                    style={[
                      styles.menuItem,
                      period === p.value && styles.menuItemSelected,
                    ]}
                  >
                    <Text style={[
                      styles.menuItemText,
                      period === p.value && styles.menuItemTextSelected,
                    ]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemSelected: {
    backgroundColor: '#F3F4F6',
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
  },
  menuItemTextSelected: {
    fontWeight: '600',
  },
});
