import { useSelector, useDispatch } from 'react-redux';
import { useCreateSavingGoalMutation } from '../../api/goalSavingApiSlice.js';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { baseApi } from '../../../../rtkQuery/baseApi.js';
import '../goalSavingContainer/GoalSavingContainer.css';

// Define validation schema using Yup for form validation
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  target: Yup.object().shape({
    minorUnits: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be greater than zero')
  }),
});

const CreateSavingGoalForm = ({ accountUid, success, closeModal, handleFormSubmissionSuccess }) => {
  const dispatch = useDispatch();
  const [createSavingGoal] = useCreateSavingGoalMutation();
  const selectedAccount = useSelector(state => state.account.selectedAccount);

  // Define initial form values and states
  const initialValues = {
    name: '',
    currency: '',
    target: { currency: '', minorUnits: null },
    base64EncodedPhoto: ''
  };

  const [formValue, setFormValue] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data on changes and set errors accordingly
  useEffect(() => {
    validationSchema
      .validate(formValue, { abortEarly: false })
      .then(() => {
        setErrors({});
      })
      .catch(error => {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      });
  }, [formValue]);

  // Handle input change for regular input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };

  // Handle input change for 'target' field
  const handleTargetInputChange = (e) => {
    const { name, value } = e.target;
    setFormValue(prevFormValue => ({
      ...prevFormValue,
      target: {
        ...prevFormValue.target,
        [name]: name === 'minorUnits' ? parseInt(value, 10) : value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data before submitting
      await validationSchema.validate(formValue, { abortEarly: false });
      
      // Create saving goal using API mutation
      const response = await createSavingGoal({
        accountUid: accountUid,
        name: formValue.name,
        currency: selectedAccount.currency,
        target: {
          currency: selectedAccount.currency,
          minorUnits: formValue.target.minorUnits,
        },
        base64EncodedPhoto: formValue.base64EncodedPhoto,
      });

      if (response && response.error) {
        console.error('Mutation error:', response.error);
      } else {
        // Handle successful form submission
        handleFormSubmissionSuccess();
        dispatch(baseApi.util.invalidateTags(['goals_list'])); // Invalidate cached data related to goals_list
        closeModal(); // Close the modal after successful form submission
      }
    } catch (error) {
      console.error('Validation or Mutation error:', error);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Input field for 'name' */}
      <div className='form-input'>
        <label className="input-label" htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formValue.name}
          onChange={handleInputChange}
          className='input-field'
        />
        {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
      </div>

      {/* Input field for 'target' amount */}
      <div className='form-input'>
        <label className="input-label" htmlFor="targetMinorUnits">Amount</label>
        <input
          id="targetMinorUnits"
          name="minorUnits"
          type="number"
          min={0}
          step={10}
          placeholder='0.00'
          value={formValue.target.minorUnits}
          onChange={handleTargetInputChange}
          className='input-field'
        />
        {errors['target.minorUnits'] && <p className='error'>{errors['target.minorUnits']}</p>}
      </div>

      {/* Submit button */}
      <div>
        <button className='buttons' type="submit" disabled={isSubmitting}>Create Goal</button>
      </div>
    </form>
  );
};

export default CreateSavingGoalForm;
