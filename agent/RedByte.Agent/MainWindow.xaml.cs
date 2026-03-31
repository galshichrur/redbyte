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

        private void SubmitButton_Click(object sender, RoutedEventArgs e)
        {
            string code = EnrollmentCodeTextBox.Text;

            if (string.IsNullOrWhiteSpace(code))
            {
                StatusTextBlock.Text = "Enter a code.";
                StatusTextBlock.Foreground = new SolidColorBrush((Color)ColorConverter.ConvertFromString("#cf3f50"));
                StatusTextBlock.Visibility = Visibility.Visible;
                return;
            }

            StatusTextBlock.Text = "Connecting...";
            StatusTextBlock.Foreground = new SolidColorBrush(Colors.DarkGray);
            StatusTextBlock.Visibility = Visibility.Visible;
            ((Button)sender).IsEnabled = false;
        }
    }
}