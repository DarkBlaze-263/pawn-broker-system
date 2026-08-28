import React, { forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Category,
  Scale,
  AttachMoney
} from '@mui/icons-material';

/**
 * JewelryItemsForm Component
 * Dynamic form for adding multiple jewelry items with add/remove functionality
 */
const JewelryItemsForm = forwardRef(({ onDataChange, initialItems = [] }, ref) => {
  const [items, setItems] = React.useState(
    initialItems.length > 0 
      ? initialItems 
      : [{
          item_type: 'gold',
          item_description: '',
          weight: '',
          current_market_value: '',
          purity: '',
          specifications: ''
        }]
  );

  // Notify parent whenever items change
  React.useEffect(() => {
    if (onDataChange) {
      onDataChange(items);
    }
  }, [items, onDataChange]);
  const [errors, setErrors] = React.useState({});

  const itemTypes = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'copper', label: 'Copper' },
    { value: 'brass', label: 'Brass' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'watches', label: 'Watches' },
    { value: 'other', label: 'Other' }
  ];

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}_${field}`];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    const newItem = {
      item_type: 'gold',
      item_description: '',
      weight: '',
      current_market_value: '',
      purity: '',
      specifications: ''
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      setErrors({ general: 'At least one item is required' });
      return;
    }

    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const validateItems = () => {
    const newErrors = {};

    items.forEach((item, index) => {
      if (!item.item_type) {
        newErrors[`${index}_item_type`] = 'Item type is required';
      }
      if (!item.item_description || !item.item_description.trim()) {
        newErrors[`${index}_item_description`] = 'Item description is required';
      }
      const marketValue = parseFloat(item.current_market_value);
      if (!item.current_market_value || isNaN(marketValue) || marketValue <= 0) {
        newErrors[`${index}_current_market_value`] = 'Market value must be a positive number';
      }
      if (item.weight !== '' && item.weight !== undefined && item.weight !== null) {
        const weight = parseFloat(item.weight);
        if (isNaN(weight) || weight < 0) {
          newErrors[`${index}_weight`] = 'Weight cannot be negative';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validateItems
  }));

  const totalMarketValue = items.reduce((sum, item) => {
    return sum + (parseFloat(item.current_market_value) || 0);
  }, 0);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <Category sx={{ mr: 1 }} />
          Jewelry Items
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addItem}
          size="small"
        >
          Add Item
        </Button>
      </Box>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      {items.map((item, index) => (
        <Box key={index}>
          {index > 0 && <Divider sx={{ my: 2 }} />}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Item #{index + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton
                color="error"
                onClick={() => removeItem(index)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors[`${index}_item_type`]}>
                <InputLabel>Item Type *</InputLabel>
                <Select
                  value={item.item_type}
                  label="Item Type *"
                  onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                >
                  {itemTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors[`${index}_item_type`] && (
                  <Typography variant="caption" color="error">
                    {errors[`${index}_item_type`]}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (grams)"
                type="number"
                value={item.weight}
                onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                error={!!errors[`${index}_weight`]}
                helperText={errors[`${index}_weight`] || 'Optional'}
                InputProps={{
                  startAdornment: <Scale sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Description *"
                multiline
                rows={2}
                value={item.item_description}
                onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                error={!!errors[`${index}_item_description`]}
                helperText={errors[`${index}_item_description`]}
                placeholder="Describe the item (e.g., Gold chain with pendant, 22 carat)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Market Value (₹) *"
                type="number"
                value={item.current_market_value}
                onChange={(e) => handleItemChange(index, 'current_market_value', e.target.value)}
                error={!!errors[`${index}_current_market_value`]}
                helperText={errors[`${index}_current_market_value`]}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Purity"
                value={item.purity}
                onChange={(e) => handleItemChange(index, 'purity', e.target.value)}
                helperText="e.g., 22, 18, 916, 750"
                placeholder="Purity percentage"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specifications"
                multiline
                rows={2}
                value={item.specifications}
                onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                placeholder="Additional specifications (e.g., Hallmark details, maker's mark)"
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Total Market Value: <strong>₹{totalMarketValue.toFixed(2)}</strong>
        </Typography>
      </Box>
    </Paper>
  );
});

export default JewelryItemsForm;
