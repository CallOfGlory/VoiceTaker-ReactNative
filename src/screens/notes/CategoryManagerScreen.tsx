import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { useNotesStore } from '../../context/NotesContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { categoryPalette } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';
import { Category } from '../../models/Category';

export function CategoryManagerScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { categories, addCategory, updateCategory, deleteCategory } = useNotesStore();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(categoryPalette[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSelectedColor(category.color);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSelectedColor(categoryPalette[0]);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingId) {
      await updateCategory(editingId, { name: trimmed, color: selectedColor });
    } else {
      await addCategory(trimmed, selectedColor);
    }
    resetForm();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typography.subtitle, { color: colors.text }]}>{t('categories.manage')}</Text>
        <View style={styles.headerButton} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<EmptyState icon="pricetags-outline" title={t('categories.empty')} />}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{item.name}</Text>
            <Pressable hitSlop={8} onPress={() => startEdit(item)}>
              <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => setDeleteTarget(item)} style={{ marginLeft: spacing.md }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.form, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.colorsRow}>
            {categoryPalette.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color, borderColor: selectedColor === color ? colors.text : 'transparent' },
                ]}
              />
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceVariant },
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t('categories.namePlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
            <Pressable
              disabled={!name.trim()}
              onPress={handleSubmit}
              style={[styles.submitButton, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.5 }]}
            >
              <Ionicons name={editingId ? 'checkmark' : 'add'} size={22} color={colors.onPrimary} />
            </Pressable>
            {editingId ? (
              <Pressable onPress={resetForm} style={[styles.submitButton, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={t('categories.deleteConfirmTitle')}
        message={t('categories.deleteConfirmMessage')}
        destructive
        confirmLabel={t('common.delete')}
        onConfirm={async () => {
          if (deleteTarget) {
            const id = deleteTarget.id;
            await deleteCategory(id);
            if (editingId === id) resetForm();
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  form: {
    borderTopWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
