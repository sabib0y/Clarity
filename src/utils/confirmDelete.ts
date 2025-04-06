import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

/**
 * Shows a confirmation dialog using SweetAlert2.
 * @param title The title of the dialog.
 * @param text The text content of the dialog.
 * @returns A promise that resolves to true if confirmed, false otherwise.
 */
export const confirmDelete = async (title: string, text: string): Promise<boolean> => {
  const result = await MySwal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33', // Red
    cancelButtonColor: '#3085d6', // Blue
    confirmButtonText: 'Yes, delete it!',
    customClass: {
      popup: '!bg-white dark:!bg-gray-800 !rounded-lg',
      title: '!text-gray-900 dark:!text-gray-100',
      htmlContainer: '!text-gray-700 dark:!text-gray-300',
      confirmButton: '!bg-red-600 hover:!bg-red-700 !focus:ring-red-500',
      cancelButton: '!bg-blue-600 hover:!bg-blue-700 !focus:ring-blue-500',
    }
  });
  return result.isConfirmed;
};
