using System.Windows;

namespace RedByte.Agent;

public partial class App : Application
{
    // Prevent from running the application twice or more.
    private static Mutex? _mutex;

    protected override async void OnStartup(StartupEventArgs e)
    {
        const string appName = "RedByteAgentMutex";
        _mutex = new Mutex(true, appName, out bool createdNew);

        if (!createdNew)
        {
            Current.Shutdown();
            return;
        }

        base.OnStartup(e);

        try
        {
            SystemUtils.Startup.SetStartup();

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
            MessageBox.Show(GetErrorMessage(ex), "RedByte", MessageBoxButton.OK, MessageBoxImage.Error);
            Current.Shutdown();
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
