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
            ResponderDetector responder = new ResponderDetector();
            List<IDetection> detectors = new List<IDetection>();
            detectors.Add(responder);
            NetworkMonitor net = new NetworkMonitor(detectors);
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