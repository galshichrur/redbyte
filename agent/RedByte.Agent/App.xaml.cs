using System.Configuration;
using System.Data;
using System.Windows;

namespace RedByte.Agent;

public partial class App : Application
{
    // Prevent from running the application twice or more
    private static Mutex _mutex = null;
    protected override async void OnStartup(StartupEventArgs e)
    {
        const string appName = "RedByteAgentMutex";
        bool createdNew;
        _mutex = new Mutex(true, appName, out createdNew);

        if (!createdNew)
        {
            System.Windows.MessageBox.Show(
                "RedByte already running.", 
                "Error", 
                System.Windows.MessageBoxButton.OK, 
                System.Windows.MessageBoxImage.Error
            );
            Application.Current.Shutdown();
            return;
        }
        
        base.OnStartup(e);

        try
        {
            bool isValid = await Enrollment.Enrollment.ValidateCredentials();
            if (isValid)
            {
                var statusWindow = new StatusWindow();
                Current.MainWindow = statusWindow;
                statusWindow.Show();
            }
            else
            {
                var enrollWindow = new EnrollWindow();
                Current.MainWindow = enrollWindow;
                enrollWindow.Show();
            }
        }
        catch (Exception ex)
        {
            System.Windows.MessageBox.Show(
                $"RedByte Agent could not connect to server.\n", 
                "Connection Error",
                System.Windows.MessageBoxButton.OK, 
                System.Windows.MessageBoxImage.Error
            );
            Application.Current.Shutdown();
        }
    }
}