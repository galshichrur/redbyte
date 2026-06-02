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
            DetectionEngine engine = new DetectionEngine(DetectionSetup.CreateDetectors());
            NetworkMonitor net = new NetworkMonitor(engine);
            net.Start();
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
