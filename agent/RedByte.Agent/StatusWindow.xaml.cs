using System.Windows;
using System.ComponentModel;

namespace RedByte.Agent
{
    public partial class StatusWindow : Window
    {
        public StatusWindow()
        {
            InitializeComponent();
        }

        private void HideButton_Click(object sender, RoutedEventArgs e)
        {
            this.Hide();
        }

        protected override void OnClosing(CancelEventArgs e)
        {
            e.Cancel = true;
            this.Hide();
        }
    }
}