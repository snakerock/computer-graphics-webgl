#include "objread.h"



int main(int argc, char **argv)

{

	obj_mesh obj;



	cout << "Reading from file " << argv[1] << endl;


	try

	{

		obj.ReadFile(string(argv[1]));

	}

	catch(exception &e)

	{

		cout << "Error: " << e.what() << endl;

		return -1;

	}



	cout << "Read:" << endl;

	cout << "Vertices: " << obj.vertices.size() << endl;

	cout << "Vertex normals: " << obj.vertex_normals.size() << endl;

	cout << "Triangles: " <<obj.triangles.size() << endl;



	cout << endl << "Writing to file " << argv[2] << endl;





	// remove this return statement to enable write to file






	try

	{

		obj.WriteFile(string(argv[2]));

	}

	catch(exception &e)

	{

		cout << "Error: " << e.what() << endl;

		return -1;

	}



	return 0;

}
