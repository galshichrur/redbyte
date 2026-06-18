using System.Windows;
using System.ComponentModel;
using RedByte.Agent.Detection;

namespace RedByte.Agent
{
    public partial class StatusWindow : Window
    {
        public StatusWindow()
        {
            InitializeComponent();

            try
            {
                DetectionEngine engine = new DetectionEngine(DetectionSetup.CreateDetectors());
                NetworkMonitor net = new NetworkMonitor(engine);
                net.Start();
            }
            catch
            {
                MessageBox.Show(
                    "Network protection could not start. Make sure WinPcap or Npcap is installed and try again.",
                    "RedByte",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);

                Application.Current.Shutdown();
            }
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
