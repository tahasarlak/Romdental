import React, { useState } from 'react';
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
import styles from './CourseDialog.module.css';
import moment from 'moment-jalaali';

moment.loadPersian({ dialect: 'persian-modern' });

type Course = ReturnType<typeof useCourseContext>['courses'][number];

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (course: Omit<Course, 'id'>) => Promise<void>;
}

const CourseDialog: React.FC<CourseDialogProps> = ({ open, onClose, onCreate }) => {
  const { showNotification } = useNotificationContext();
  const { universities, categories, countries, addUniversity, addCategory, addCountry } = useCourseContext();
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    instructor: '',
    description: '',
    duration: '',
    courseNumber: 'Course 1',
    category: '',
    image: '',
    price: '',
    discountPrice: '',
    discountPercentage: undefined,
    startDateJalali: '',
    startDateGregorian: '',
    isOpen: true,
    isFeatured: false,
    enrollmentCount: 0,
    syllabus: [],
    faqs: [],
    courseType: 'Online',
    university: '',
    currency: 'IRR',
    countries: [],
  });

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

  const jalaliToGregorian = (jalaliDate: string): string | null => {
    if (!/^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(jalaliDate)) return null;
    try {
      const jalaliMoment = moment(jalaliDate, 'jYYYY/jMM/jDD');
      return jalaliMoment.isValid() ? jalaliMoment.format('YYYY-MM-DD') : null;
    } catch {
      return null;
    }
  };

  const handleCourseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    let updatedCourse = { ...newCourse, [name]: value };

    if (name === 'discountPercentage' && value) {
      const percentage = parseFloat(value);
      if (percentage >= 0 && percentage <= 100 && newCourse.price) {
        const priceNum = parseFloat(newCourse.price.replace(/,/g, ''));
        if (!isNaN(priceNum)) {
          const discountPrice = priceNum * (1 - percentage / 100);
          updatedCourse.discountPrice = Math.round(discountPrice).toLocaleString('fa-IR') + ' تومان';
        }
      }
    } else if (name === 'discountPrice' && value) {
      const discountPriceNum = parseFloat(value.replace(/,/g, ''));
      if (newCourse.price) {
        const priceNum = parseFloat(newCourse.price.replace(/,/g, ''));
        if (!isNaN(priceNum) && !isNaN(discountPriceNum) && discountPriceNum < priceNum) {
          const percentage = ((priceNum - discountPriceNum) / priceNum) * 100;
          updatedCourse.discountPercentage = Math.round(percentage);
        }
      }
    } else if (name === 'startDateJalali' && value) {
      const gregorianDate = jalaliToGregorian(value);
      if (gregorianDate) {
        updatedCourse.startDateGregorian = gregorianDate;
      }
    }

    setNewCourse(updatedCourse);
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAutocompleteChange = (name: string, value: string | string[] | null) => {
    setNewCourse((prev) => ({ ...prev, [name]: value || (name === 'countries' ? [] : undefined) }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageInputModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'url' | 'upload'
  ) => {
    if (newMode) {
      setImageInputMode(newMode);
      setNewCourse((prev) => ({ ...prev, image: '' }));
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, image: validateField('image', '') }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setNewCourse((prev) => ({ ...prev, image: file ? URL.createObjectURL(file) : '' }));
    setErrors((prev) => ({ ...prev, image: validateField('image', file ? file.name : '') }));
  };

  const handleCreate = async () => {
    const newErrors: { [key: string]: string } = {};
    ['title', 'instructor', 'description', 'price', 'startDateJalali', 'startDateGregorian', 'category', 'image', 'currency', 'countries'].forEach((field) => {
      const error = validateField(field, newCourse[field as keyof Course]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('لطفاً تمام فیلدهای الزامی را به درستی پر کنید!', 'error');
      return;
    }

    if (newCourse.startDateJalali && newCourse.startDateGregorian) {
      const gregorianFromJalali = jalaliToGregorian(newCourse.startDateJalali);
      if (gregorianFromJalali !== newCourse.startDateGregorian) {
        setErrors((prev) => ({ ...prev, startDateJalali: 'تاریخ‌های جلالی و میلادی همخوانی ندارند' }));
        showNotification('تاریخ‌های جلالی و میلادی همخوانی ندارند!', 'error');
        return;
      }
    }

    if (newCourse.university && !universities.includes(newCourse.university)) {
      addUniversity(newCourse.university);
    }
    if (newCourse.category && !categories.includes(newCourse.category)) {
      addCategory(newCourse.category);
    }
    if (newCourse.countries) {
      newCourse.countries.forEach((country) => {
        if (!countries.includes(country)) {
          addCountry(country);
        }
      });
    }

    const course: Omit<Course, 'id'> = {
      ...newCourse,
      slug: newCourse.title?.replace(/\s+/g, '-').toLowerCase(),
      enrollmentCount: 0,
      syllabus: [],
      faqs: [],
      tags: newCourse.tags || [],
      prerequisites: newCourse.prerequisites || [],
      courseType: newCourse.courseType || 'Online',
      university: newCourse.university || undefined,
      courseNumber: newCourse.courseNumber || 'Course 1',
      category: newCourse.category || '',
      image: newCourse.image || '',
      discountPrice: newCourse.discountPrice || undefined,
      discountPercentage: newCourse.discountPercentage || undefined,
      currency: newCourse.currency || 'IRR',
      countries: newCourse.countries || [],
      startDateJalali: newCourse.startDateJalali || '',
      startDateGregorian: newCourse.startDateGregorian || '',
    } as Omit<Course, 'id'>;

    try {
      await onCreate(course);
      setNewCourse({
        title: '',
        instructor: '',
        description: '',
        duration: '',
        courseNumber: 'Course 1',
        category: '',
        image: '',
        price: '',
        discountPrice: '',
        discountPercentage: undefined,
        startDateJalali: '',
        startDateGregorian: '',
        isOpen: true,
        isFeatured: false,
        enrollmentCount: 0,
        syllabus: [],
        faqs: [],
        courseType: 'Online',
        university: '',
        currency: 'IRR',
        countries: [],
      });
      setSelectedFile(null);
      setImageInputMode('url');
      onClose();
      showNotification('دوره با موفقیت ایجاد شد!', 'success');
    } catch (error) {
      showNotification('خطایی در ایجاد دوره رخ داد.', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth className={styles.dialog}>
      <DialogTitle className={styles.dialogTitle}>ایجاد دوره جدید</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="عنوان دوره"
          type="text"
          fullWidth
          value={newCourse.title}
          onChange={handleCourseInputChange}
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
          value={newCourse.instructor}
          onChange={handleCourseInputChange}
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
          value={newCourse.description}
          onChange={handleCourseInputChange}
          required
          error={!!errors.description}
          helperText={errors.description}
          className={styles.textField}
        />
        <FormControl fullWidth margin="dense" error={!!errors.courseType}>
          <InputLabel>نوع دوره</InputLabel>
          <Select
            name="courseType"
            value={newCourse.courseType}
            onChange={handleCourseInputChange}
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
          value={newCourse.category || ''}
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
          value={newCourse.university || ''}
          onChange={(event, value) => handleAutocompleteChange('university', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              name="university"
              label="دانشگاه"
              fullWidth
              error={!!errors.university}
              helperText={errors.university || 'دانشگاه را وارد کنید یا از موجود انتخاب کنید'}
              className={styles.textField}
            />
          )}
        />
        <Autocomplete
          multiple
          freeSolo
          options={countries}
          value={newCourse.countries || []}
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
          name="duration"
          label="مدت زمان (اختیاری)"
          type="text"
          fullWidth
          value={newCourse.duration}
          onChange={handleCourseInputChange}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="price"
          label="قیمت (مثال: ۴,۵۰۰,۰۰۰)"
          type="text"
          fullWidth
          value={newCourse.price}
          onChange={handleCourseInputChange}
          required
          error={!!errors.price}
          helperText={errors.price}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="discountPrice"
          label="قیمت با تخفیف (اختیاری، مثال: ۳,۸۰۰,۰۰۰)"
          type="text"
          fullWidth
          value={newCourse.discountPrice}
          onChange={handleCourseInputChange}
          error={!!errors.discountPrice}
          helperText={errors.discountPrice}
          className={styles.textField}
        />
        <TextField
          margin="dense"
          name="discountPercentage"
          label="درصد تخفیف (اختیاری)"
          type="number"
          fullWidth
          value={newCourse.discountPercentage || ''}
          onChange={handleCourseInputChange}
          inputProps={{ min: 0, max: 100 }}
          className={styles.textField}
        />
        <FormControl fullWidth margin="dense" error={!!errors.currency}>
          <InputLabel>واحد پول</InputLabel>
          <Select
            name="currency"
            value={newCourse.currency}
            onChange={handleCourseInputChange}
            label="واحد پول"
            className={styles.select}
          >
            <MenuItem value="IRR">تومان (IRR)</MenuItem>
            <MenuItem value="RUB">روبل (RUB)</MenuItem>
            <MenuItem value="CNY">یوان (CNY)</MenuItem>
          </Select>
          <FormHelperText>{errors.currency}</FormHelperText>
        </FormControl>
        <TextField
          margin="dense"
          name="startDateJalali"
          label="تاریخ شروع جلالی (YYYY/MM/DD)"
          type="text"
          fullWidth
          value={newCourse.startDateJalali}
          onChange={handleCourseInputChange}
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
          value={newCourse.startDateGregorian}
          onChange={handleCourseInputChange}
          required
          error={!!errors.startDateGregorian}
          helperText={errors.startDateGregorian}
          className={styles.textField}
        />
        <FormControlLabel
          control={
            <Switch
              checked={newCourse.isOpen}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, isOpen: e.target.checked }))}
              name="isOpen"
            />
          }
          label="دوره باز است"
          className={styles.switch}
        />
        <FormControlLabel
          control={
            <Switch
              checked={newCourse.isFeatured}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              name="isFeatured"
            />
          }
          label="دوره ویژه"
          className={styles.switch}
        />
        <ToggleButtonGroup
          value={imageInputMode}
          exclusive
          onChange={handleImageInputModeChange}
          aria-label="روش ورود تصویر"
          className={styles.toggleButtonGroup}
        >
          <ToggleButton value="url" aria-label="لینک تصویر">
            لینک تصویر
          </ToggleButton>
          <ToggleButton value="upload" aria-label="آپلود تصویر">
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
            value={newCourse.image}
            onChange={handleCourseInputChange}
            required
            error={!!errors.image}
            helperText={errors.image}
            className={styles.textField}
          />
        ) : (
          <TextField
            margin="dense"
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
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} color="primary" className={styles.button}>
          لغو
        </Button>
        <Button onClick={handleCreate} color="primary" variant="contained" className={styles.button}>
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDialog;