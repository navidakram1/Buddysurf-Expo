import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletScreen() {
  const [balance, setBalance] = useState(125.50);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    // Mock transaction data
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'credit',
        amount: 50.00,
        description: 'Payment received for tutoring',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
      },
      {
        id: '2',
        type: 'debit',
        amount: 25.00,
        description: 'Paid for fitness training',
        date: '2024-01-14T15:45:00Z',
        status: 'completed',
      },
      {
        id: '3',
        type: 'credit',
        amount: 100.50,
        description: 'Funds added via credit card',
        date: '2024-01-13T09:15:00Z',
        status: 'completed',
      },
      {
        id: '4',
        type: 'debit',
        amount: 15.00,
        description: 'Service fee',
        date: '2024-01-12T14:20:00Z',
        status: 'completed',
      },
    ];

    setTransactions(mockTransactions);
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBalance = balance + parseFloat(amount);
      setBalance(newBalance);
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'credit',
        amount: parseFloat(amount),
        description: 'Funds added via credit card',
        date: new Date().toISOString(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setAmount('');
      setShowAddFundsModal(false);
      Alert.alert('Success', 'Funds added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBalance = balance - parseFloat(amount);
      setBalance(newBalance);
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'debit',
        amount: parseFloat(amount),
        description: 'Withdrawal to bank account',
        date: new Date().toISOString(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setAmount('');
      setShowWithdrawModal(false);
      Alert.alert('Success', 'Withdrawal initiated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? '#22c55e' : '#ef4444';
  };

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: getTransactionColor(transaction.type) + '20' }
      ]}>
        <Ionicons 
          name={getTransactionIcon(transaction.type) as any} 
          size={24} 
          color={getTransactionColor(transaction.type)} 
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>
          {transaction.description}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: getTransactionColor(transaction.type) }
        ]}>
          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </Text>
        <View style={[
          styles.statusBadge,
          transaction.status === 'completed' && styles.completedBadge,
          transaction.status === 'pending' && styles.pendingBadge,
          transaction.status === 'failed' && styles.failedBadge,
        ]}>
          <Text style={[
            styles.statusText,
            transaction.status === 'completed' && styles.completedText,
            transaction.status === 'pending' && styles.pendingText,
            transaction.status === 'failed' && styles.failedText,
          ]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderModal = (visible: boolean, onClose: () => void, onSubmit: () => void, title: string) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onSubmit} disabled={loading}>
            <Text style={[styles.modalSave, loading && styles.modalSaveDisabled]}>
              {loading ? 'Processing...' : 'Confirm'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Amount</Text>
          <TextInput
            style={styles.modalInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            autoFocus
          />
          
          <View style={styles.quickAmounts}>
            {[10, 25, 50, 100].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountButton}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>${quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addFundsButton}
            onPress={() => setShowAddFundsModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addFundsText}>Add Funds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => setShowWithdrawModal(true)}
          >
            <Ionicons name="arrow-up" size={20} color="#22c55e" />
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>$275.50</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>$150.00</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map(renderTransaction)
        )}
      </View>

      {/* Modals */}
      {renderModal(
        showAddFundsModal,
        () => setShowAddFundsModal(false),
        handleAddFunds,
        'Add Funds'
      )}
      
      {renderModal(
        showWithdrawModal,
        () => setShowWithdrawModal(false),
        handleWithdraw,
        'Withdraw Funds'
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addFundsText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '600',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  withdrawText: {
    marginLeft: 8,
    color: '#22c55e',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  transactionsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  failedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  completedText: {
    color: '#166534',
  },
  pendingText: {
    color: '#92400e',
  },
  failedText: {
    color: '#dc2626',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancel: {
    fontSize: 16,
    color: '#ef4444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  modalSaveDisabled: {
    color: '#9ca3af',
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});
