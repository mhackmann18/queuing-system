using System.Data.Common;
using MySqlConnector;
using TodoApi.Models;

namespace DMVApi;

public class DMVRepository(MySqlDataSource database) 
{
    public async Task<Customer?> FindOneAsync(int id) {
        using var connection = await database.OpenConnectionAsync();
        using var command = connection.CreateCommand();

        // command.CommandText = @"SELECT `Id`, `Title`, `Content` FROM `BlogPost` WHERE `Id` = @id";
        command.CommandText = @"SELECT * FROM DMVv2.CUSTOMER WHERE customer_id = @id";
        command.Parameters.AddWithValue("@id", id);
        // var result = await ReadAllAsync(await command.ExecuteReaderAsync(), connection);

        // command.CommandText = @"SELECT * FROM DMVv2.WAITINGLIST WHERE customer_id = @id";
        // var result2 = await ReadWaitingListAsync(await command.ExecuteReaderAsync(), (Customer)result);

        DbDataReader reader = await command.ExecuteReaderAsync();
        var customers = new List<Customer>();

        while (await reader.ReadAsync())
        {
            var customer = new Customer
                    {
                        // Id = reader.GetInt32(0),
                        FirstName = reader.GetString(0),
                        LastName = reader.GetString(1),
                        Id = reader.GetInt64(2),
                        // Content = reader.GetString(2),

                        CheckInTime = reader.GetDateTime(3),
                        // DepartmentId = reader.GetInt64(4)
                    };

                    customers.Add(customer);

        }

        reader.Close();

        command.CommandText = @"SELECT * FROM DMVv2.WAITINGLIST WHERE customer_id = @id";
        // command.Parameters.AddWithValue("@id", id);

        reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            long departmentId = reader.GetInt64(1);
            string customerStatus = reader.GetString(2);
            CustomerStatus junk = new CustomerStatus();

            // Console.WriteLine(customerStatus);

            if(departmentId == 1) {
                customers[0].MotorVehicle = new MotorVehicle();
                Enum.TryParse(customerStatus, out junk);
                // customers[0].MotorVehicle.Status = junk;
            } 
            if(departmentId == 2) {
                customers[0].DriversLicense = new DriversLicense();
                Enum.TryParse(customerStatus, out junk);
                Console.WriteLine(junk);
                customers[0].DriversLicense.Status = junk;
                // Console.WriteLine(customers[0].DriversLicense.Status);

            } 
        }

        // Customer junk = new Customer { FirstName ="Junk", LastName="McJunkerson"};
        // Console.WriteLine(customers[0].DriversLicense.Status);

        return customers[0];

        // return result.FirstOrDefault();
    }

     private async Task<IReadOnlyList<Customer>> ReadAllAsync(DbDataReader reader, MySqlConnection connection)
    {
        var customers = new List<Customer>();
        using (reader)
        {
            while (await reader.ReadAsync())
            {
                var customer = new Customer
                {
                    // Id = reader.GetInt32(0),
                    FirstName = reader.GetString(0),
                    LastName = reader.GetString(1),
                    Id = reader.GetInt64(2),
                    // Content = reader.GetString(2),

                    CheckInTime = reader.GetDateTime(3),
                    // DepartmentId = reader.GetInt64(4)
                };

                using var command = connection.CreateCommand();
                command.CommandText = @"SELECT * FROM DMVv2.WAITINGLIST WHERE customer_id = @id";
                command.Parameters.AddWithValue("@id", customer.Id);

                DbDataReader reader2 = await command.ExecuteReaderAsync();
                using (reader2) {
                    long departmentId = reader2.GetInt64(1);
                    string customerStatus = reader2.GetString(2);
                    CustomerStatus junk = new CustomerStatus();

                    if(departmentId == 1) {
                        customer.MotorVehicle = new MotorVehicle();
                        Enum.TryParse(customerStatus, out junk);
                        customer.MotorVehicle.Status = junk;
                    } 
                    if(departmentId == 2) {
                        customer.DriversLicense = new DriversLicense();
                        Enum.TryParse(customerStatus, out junk);
                        customer.DriversLicense.Status = junk;
                    } 
                }
                // var result = await ReadAllAsync(await command.ExecuteReaderAsync(), connection);


                customers.Add(customer);
            }
        }
        return customers;
    }

//      private async Task<IReadOnlyList<Customer>> ReadWaitingListAsync(DbDataReader reader, Customer customer)
//     {
//         using (reader)
//         {
//             while (await reader.ReadAsync())
//             {
//                 long departmentId = reader.GetInt64(1);
//                 string customerStatus = reader.GetString(2);
//                 CustomerStatus junk = new CustomerStatus();

//                 if(departmentId == 1) {
//                     customer.MotorVehicle = new MotorVehicle();
//                     Enum.TryParse(customerStatus, out junk);
//                     customer.MotorVehicle.Status = junk;
//                 } 
//                 if(departmentId == 2) {
//                     customer.DriversLicense = new DriversLicense();
//                     Enum.TryParse(customerStatus, out junk);
//                     customer.DriversLicense.Status = junk;
//                 } 
                
//             }
//         }
//         return (IReadOnlyList<Customer>)customer;
//     }

}

 

