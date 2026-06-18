using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace RedByte.Agent
{
    public partial class EnrollWindow : Window
    {
        public EnrollWindow()
        {
            InitializeComponent();
        }

        private async void SubmitButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string code = EnrollmentCodeTextBox.Text;

                if (string.IsNullOrWhiteSpace(code))
                {
                    StatusTextBlock.Text = "Invalid enrollment code.";
                    StatusTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#cf3f50"));
                    StatusTextBlock.Visibility = Visibility.Visible;
                    return;
                }
                
                StatusTextBlock.Text = "Validating enrollment code...";
                StatusTextBlock.Foreground = new SolidColorBrush(Colors.DarkGray);
                StatusTextBlock.Visibility = Visibility.Visible;
                ((Button)sender).IsEnabled = false;
                
                bool success = await Enrollment.Enrollment.ValidateEnrollmentToken(code);
                if (!success)
                {
                    StatusTextBlock.Text = "Invalid enrollment code. \nMake sure it is the exact same code from dashboard.";
                    StatusTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#cf3f50"));
                    StatusTextBlock.Visibility = Visibility.Visible;
                    ((Button)sender).IsEnabled = true;
                    return;
                }
                
                // Successfully connected
                StatusWindow statusWindow = new StatusWindow();
                Application.Current.MainWindow = statusWindow;
                statusWindow.Show();
                this.Close();
            }
            catch (Exception ex)
            {
                string message = GetErrorMessage(ex);
                MessageBox.Show(message, "RedByte", MessageBoxButton.OK, MessageBoxImage.Error);
                StatusTextBlock.Text = message;
                StatusTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#cf3f50"));
                StatusTextBlock.Visibility = Visibility.Visible;
                ((Button)sender).IsEnabled = true;
            }
        }

        private static string GetErrorMessage(Exception ex)
        {
            if (ex.Message.StartsWith("Server is not responding"))
            {
                return ex.Message;
            }

            return "Something went wrong. Please try again.";
        }
    }
}
