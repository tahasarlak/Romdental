import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useNotificationContext } from '../../../../Context/NotificationContext';
import { useCourseContext } from '../../../../Context/CourseContext';
import moment from 'moment-jalaali';
import styles from './CourseDialog.module.css';

type Course = ReturnType<typeof useCourseContext>['courses'][number];

interface EditCourseDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course;
  onUpdate: (course: Course) => void;
}

const EditCourseDialog: React.FC<EditCourseDialogProps> = ({ open, onClose, course, onUpdate }) => {
  const { showNotification } = useNotificationContext();
  const { universities, categories, countries, addUniversity, addCategory, addCountry } = useCourseContext();
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Course>({ ...course, currency: course.currency || 'IRR', countries: course.countries || [] });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFormData({ ...course, currency: course.currency || 'IRR', countries: course.countries || [] });
    setImageInputMode(course.image.startsWith('blob:') ? 'upload' : 'url');
  }, [course]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'title':
        return !value || value.trim() === '' ? 'عنوان دوره الزامی است' : '';
      case 'instructor':
        return !value || value.trim() === '' ? 'نام استاد الزامی است' : '';
      case 'description':
        return !value || value.trim() === '' ? 'توضیحات الزامی است' : '';
      case 'price':
        return !value || !/^\d+(,\d{3})*( تومان)?$/.test(value) ? 'قیمت باید به فرمت معتبر وارد شود (مثال: ۴,۵۰۰,۰۰۰)' : '';
      case 'startDateJalali':
        return !value || !/^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(value) ? 'تاریخ شروع جلالی باید به فرمت YYYY/MM/DD باشد' : '';
      case 'startDateGregorian':
        return !value || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value) ? 'تاریخ شروع میلادی باید به فرمت YYYY-MM-DD باشد' : '';
      case 'category':
        return !value || value.trim() === '' ? 'دسته‌بندی الزامی است' : '';
      case 'image':
        if (imageInputMode === 'url') {
          return value && !/^https?:\/\/.*/.test(value) ? 'لینک تصویر باید معتبر باشد' : '';
        }
        return selectedFile ? '' : value ? '' : 'تصویر یا لینک تصویر الزامی است';
      case 'discountPrice':
        return value && !/^\d+(,\d{3})*( تومان)?$/.test(value) ? 'قیمت تخفیف باید به فرمت معتبر وارد شود (مثال: ۳,۸۰۰,۰۰۰)' : '';
      case 'currency':
        return !value || value.trim() === '' ? 'واحد پول الزامی است' : '';
      case 'countries':
        return !value || value.length === 0 ? 'حداقل یک کشور باید انتخاب شود' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'discountPercentage' && value) {
      const percentage = parseFloat(value);
      if (percentage >= 0 && percentage <= 100 && formData.price) {
        const priceNum = parseFloat(formData.price.replace(/,/g, ''));
        if (!isNaN(priceNum)) {
          const discountPrice = priceNum * (1 - percentage / 100);
          updatedFormData.discountPrice = Math.round(discountPrice).toLocaleString('fa-IR') + ' تومان';
        }
      }
    } else if (name === 'discountPrice' && value) {
      const discountPriceNum = parseFloat(value.replace(/,/g, ''));
      if (formData.price) {
        const priceNum = parseFloat(formData.price.replace(/,/g, ''));
        if (!isNaN(priceNum) && !isNaN(discountPriceNum) && discountPriceNum < priceNum) {
          const percentage = ((priceNum - discountPriceNum) / priceNum) * 100;
          updatedFormData.discountPercentage = Math.round(percentage);
        }
      }
    } else if (name === 'startDateJalali' && value) {
      const gregorianDate = jalaliToGregorian(value);
      if (gregorianDate) {
        updatedFormData.startDateGregorian = gregorianDate;
      }
    }

    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAutocompleteChange = (name: string, value: string | string[] | null) => {
    setFormData((prev) => ({ ...prev, [name]: value || (name === 'countries' ? [] : undefined) }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageInputModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'url' | 'upload'
  ) => {
    if (newMode) {
      setImageInputMode(newMode);
      setFormData((prev) => ({ ...prev, image: '' }));
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, image: validateField('image', '') }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setFormData((prev) => ({ ...prev, image: file ? URL.createObjectURL(file) : '' }));
    setErrors((prev) => ({ ...prev, image: validateField('image', file ? file.name : '') }));
  };

  const jalaliToGregorian = (jalaliDate: string): string | null => {
    if (!/^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(jalaliDate)) return null;
    try {
      const jalaliMoment = moment(jalaliDate, 'jYYYY/jMM/jDD');
      return jalaliMoment.isValid() ? jalaliMoment.format('YYYY-MM-DD') : null;
    } catch {
      return null;
    }
  };

  const handleUpdate = () => {
    const newErrors: { [key: string]: string } = {};
    ['title', 'instructor', 'description', 'price', 'startDateJalali', 'startDateGregorian', 'category', 'image', 'currency', 'countries'].forEach((field) => {
      const error = validateField(field, formData[field as keyof Course]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('لطفاً تمام فیلدهای الزامی را به درستی پر کنید!', 'error');
      return;
    }

    if (formData.startDateJalali && formData.startDateGregorian) {
      const gregorianFromJalali = jalaliToGregorian(formData.startDateJalali);
      if (gregorianFromJalali !== formData.startDateGregorian) {
        setErrors((prev) => ({ ...prev, startDateJalali: 'تاریخ‌های جلالی و میلادی همخوانی ندارند' }));
        showNotification('تاریخ‌های جلالی و میلادی همخوانی ندارند!', 'error');
        return;
      }
    }

    if (formData.university && !universities.includes(formData.university)) {
      addUniversity(formData.university);
    }
    if (formData.category && !categories.includes(formData.category)) {
      addCategory(formData.category);
    }
    if (formData.countries) {
      formData.countries.forEach((country) => {
        if (!countries.includes(country)) {
          addCountry(country);
        }
      });
    }

    const updatedCourse: Course = {
      ...formData,
      slug: formData.title.replace(/\s+/g, '-').toLowerCase(),
      university: formData.university || undefined,
      discountPrice: formData.discountPrice || undefined,
      discountPercentage: formData.discountPercentage || undefined,
      currency: formData.currency || 'IRR',
      countries: formData.countries || [],
    };
    onUpdate(updatedCourse);
    setSelectedFile(null);
    setImageInputMode('url');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ویرایش دوره</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="عنوان دوره"
          type="text"
          fullWidth
          value={formData.title}
          onChange={handleInputChange}
          required
          error={!!errors.title}
          helperText={errors.title}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="instructor"
          label="نام استاد"
          type="text"
          fullWidth
          value={formData.instructor}
          onChange={handleInputChange}
          required
          error={!!errors.instructor}
          helperText={errors.instructor}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="description"
          label="توضیحات"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          required
          error={!!errors.description}
          helperText={errors.description}
          className={styles.textField}
        />
        <FormControl fullWidth margin="dense" error={!!errors.courseType}>
          <InputLabel>نوع دوره</InputLabel>
          <Select
            name="courseType"
            value={formData.courseType}
            onChange={handleInputChange}
            label="نوع دوره"
            className={styles.select}
          >
            <MenuItem value="Online">آنلاین</MenuItem>
            <MenuItem value="Offline">آفلاین</MenuItem>
            <MenuItem value="In-Person">حضوری</MenuItem>
            <MenuItem value="Hybrid">ترکیبی</MenuItem>
          </Select>
        </FormControl>
        <Autocomplete
          freeSolo
          options={categories}
          value={formData.category || ''}
          onChange={(event, value) => handleAutocompleteChange('category', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              name="category"
              label="دسته‌بندی"
              fullWidth
              required
              error={!!errors.category}
              helperText={errors.category || 'دسته‌بندی را وارد کنید یا از موجود انتخاب کنید'}
              className={styles.textField}
            />
          )}
        />
        <Autocomplete
          freeSolo
          options={universities}
          value={formData.university || ''}
          onChange={(event, value) => handleAutocompleteChange('university', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              name="university"
              label="دانشگاه"
              fullWidth
              error={!!errors.university}
              helperText={errors.university || 'دانشگاه را وارد کنید یا از موجود انتخاب کنید (اختیاری)'}
              className={styles.textField}
            />
          )}
        />
        <Autocomplete
          multiple
          freeSolo
          options={countries}
          value={formData.countries || []}
          onChange={(event, value) => handleAutocompleteChange('countries', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              name="countries"
              label="کشورها"
              fullWidth
              required
              error={!!errors.countries}
              helperText={errors.countries || 'کشورها را وارد کنید یا از موجود انتخاب کنید'}
              className={styles.textField}
            />
          )}
        />
        <TextField
          margin="dense"
          name="price"
          label="قیمت (تومان)"
          type="text"
          fullWidth
          value={formData.price}
          onChange={handleInputChange}
          required
          error={!!errors.price}
          helperText={errors.price}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="discountPrice"
          label="قیمت با تخفیف (تومان)"
          type="text"
          fullWidth
          value={formData.discountPrice || ''}
          onChange={handleInputChange}
          error={!!errors.discountPrice}
          helperText={errors.discountPrice || 'قیمت با تخفیف را وارد کنید (اختیاری)'}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="discountPercentage"
          label="درصد تخفیف"
          type="number"
          fullWidth
          value={formData.discountPercentage || ''}
          onChange={handleInputChange}
          inputProps={{ min: 0, max: 100 }}
          helperText="درصد تخفیف را وارد کنید (0-100، اختیاری)"
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="currency"
          label="واحد پول"
          type="text"
          fullWidth
          value={formData.currency || 'IRR'}
          onChange={handleInputChange}
          required
          error={!!errors.currency}
          helperText={errors.currency || 'واحد پول را وارد کنید (مثال: IRR)'}
          className={styles.textField}
        />
        <ToggleButtonGroup
          value={imageInputMode}
          exclusive
          onChange={handleImageInputModeChange}
          aria-label="image input mode"
          className={styles.toggleButtonGroup}
        >
          <ToggleButton value="url" aria-label="url input">
            لینک تصویر
          </ToggleButton>
          <ToggleButton value="upload" aria-label="file upload">
            آپلود تصویر
          </ToggleButton>
        </ToggleButtonGroup>
        {imageInputMode === 'url' ? (
          <TextField
            margin="dense"
            name="image"
            label="لینک تصویر"
            type="text"
            fullWidth
            value={formData.image}
            onChange={handleInputChange}
            required
            error={!!errors.image}
            helperText={errors.image}
            className={styles.textField}
          />
        ) : (
          <TextField
            margin="dense"
            name="image"
            type="file"
            fullWidth
            onChange={handleFileChange}
            required
            error={!!errors.image}
            helperText={errors.image}
            className={styles.textField}
            InputProps={{ inputProps: { accept: 'image/*' } }}
          />
        )}
        <TextField
          margin="dense"
          name="startDateJalali"
          label="تاریخ شروع جلالی (YYYY/MM/DD)"
          type="text"
          fullWidth
          value={formData.startDateJalali}
          onChange={handleInputChange}
          required
          error={!!errors.startDateJalali}
          helperText={errors.startDateJalali}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="startDateGregorian"
          label="تاریخ شروع میلادی (YYYY-MM-DD)"
          type="text"
          fullWidth
          value={formData.startDateGregorian}
          onChange={handleInputChange}
          required
          error={!!errors.startDateGregorian}
          helperText={errors.startDateGregorian}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="duration"
          label="مدت زمان"
          type="text"
          fullWidth
          value={formData.duration}
          onChange={handleInputChange}
          className={styles.textField}
        />
        <FormControl fullWidth margin="dense" error={!!errors.courseNumber}>
          <InputLabel>شماره کورس</InputLabel>
          <Select
            name="courseNumber"
            value={formData.courseNumber}
            onChange={handleInputChange}
            label="شماره کورس"
            className={styles.select}
          >
            <MenuItem value="Course 1">Course 1</MenuItem>
            <MenuItem value="Course 2">Course 2</MenuItem>
            <MenuItem value="Course 3">Course 3</MenuItem>
            <MenuItem value="Course 4">Course 4</MenuItem>
            <MenuItem value="Course 5">Course 5</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={formData.isOpen}
              onChange={(e) => setFormData((prev) => ({ ...prev, isOpen: e.target.checked }))}
              name="isOpen"
            />
          }
          label="وضعیت دوره (باز/بسته)"
          className={styles.switch}
        />
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelButton}>
          لغو
        </Button>
        <Button onClick={handleUpdate} variant="contained" className={styles.createButton}>
          به‌روزرسانی
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCourseDialog;