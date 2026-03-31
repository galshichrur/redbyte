using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace RedByte.Agent
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private async void SubmitButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string code = EnrollmentCodeTextBox.Text;

                bool success = false;
                if (string.IsNullOrWhiteSpace(code))
                {
                    success = false;
                }
                else
                {
                    success = await Enrollment.Enrollment.ValidateEnrollmentToken(code);
                }

                if (!success)
                {
                    StatusTextBlock.Text =
                        "Invalid enrollment code. Make sure it is the exact same code from dashboard and it is still valid.";
                    StatusTextBlock.Foreground =
                        new SolidColorBrush((Color)ColorConverter.ConvertFromString("#cf3f50"));
                    StatusTextBlock.Visibility = Visibility.Visible;
                    return;
                }

                StatusTextBlock.Text = "Connecting...";
                StatusTextBlock.Foreground = new SolidColorBrush(Colors.DarkGray);
                StatusTextBlock.Visibility = Visibility.Visible;
                ((Button)sender).IsEnabled = false;
            }
            catch (Exception ex)
            {
                StatusTextBlock.Text = ex.Message;
                StatusTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#cf3f50"));
                StatusTextBlock.Visibility = Visibility.Visible;
                ((Button)sender).IsEnabled = false;
            }
        }
    }
}