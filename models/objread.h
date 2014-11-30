#include <set>

using std::set;



#include <fstream>

using std::ifstream;

using std::ofstream;



#include <string>

using std::string;



#include <iostream>

using std::cout;

using std::endl;



#include <vector>

using std::vector;



#include <sstream>

using std::istringstream;



#include <cctype>

using std::tolower;



#include <stdexcept>
#include <exception>
using std::exception;
using std::runtime_error;

using std::bad_alloc;



#include <cmath>

using std::sqrt;



#include <iomanip>

using std::setiosflags;

using std::setprecision;



#include <ios>



string lower_string(const string &src_string)

{

	string temp = src_string;



	for(string::iterator i = temp.begin(); i != temp.end(); i++)

		*i = tolower(*i);



	return temp;

}



struct vertex

{

	double x,y,z;



	bool operator==(const vertex &right) const

	{

		if(right.x == x && right.y == y && right.z == z)

			return true;

		else

			return false;

	}



	vertex& operator=(const vertex &right)

	{

		x = right.x;

		y = right.y;

		z = right.z;



		return *this;

	}

};



struct triangle

{

	size_t vertex_indices[3];

	size_t vertex_normal_indices[3];



	bool operator<(const triangle &right) const

	{

		if(right.vertex_indices[0] > vertex_indices[0])

			return true;

		else if(right.vertex_indices[0] < vertex_indices[0])

			return false;



		if(right.vertex_indices[1] > vertex_indices[1])

			return true;

		else if(right.vertex_indices[1] < vertex_indices[1])

			return false;



		if(right.vertex_indices[2] > vertex_indices[2])

			return true;

		else if(right.vertex_indices[2] < vertex_indices[2])

			return false;



		return false;

	}



	bool operator==(const triangle &right) const

	{

		if( right.vertex_indices[0] == vertex_indices[0] && 

			right.vertex_indices[1] == vertex_indices[1] && 

			right.vertex_indices[2] == vertex_indices[2] )

		{

			return true;

		}



		if( right.vertex_indices[2] == vertex_indices[0] && 

			right.vertex_indices[0] == vertex_indices[1] && 

			right.vertex_indices[1] == vertex_indices[2] )

		{

			return true;

		}



		if( right.vertex_indices[1] == vertex_indices[0] && 

			right.vertex_indices[2] == vertex_indices[1] && 

			right.vertex_indices[0] == vertex_indices[2] )

		{

			return true;

		}



		return false;

	}



	triangle& operator=(const triangle &right)

	{

		vertex_indices[0] = right.vertex_indices[0];

		vertex_indices[1] = right.vertex_indices[1];

		vertex_indices[2] = right.vertex_indices[2];



		return *this;

	}

};



class obj_mesh

{

public:

	vector<vertex> vertices;

	vector<vertex> vertex_normals;

	vector<triangle> triangles;



	void ReadFile(const string &in_obj_filename)

	{

		vertices.clear();

		vertex_normals.clear();

		triangles.clear();



		ParseObjFile(in_obj_filename);

		ValidateIndices();

	}



	void WriteFile(const string &out_obj_filename)

	{
		ofstream out(out_obj_filename.c_str());


		if(out.fail()) {
			throw runtime_error("Could not create/open file.");
        }

		out << setiosflags(std::ios::fixed);

		out << setprecision(18);



		out << "o obj_mesh\n";

		out << "g obj_mesh\n";

		out << "\n# " << vertices.size() << " vertices" << "\n";

		for(size_t i = 0; i < vertices.size(); i++)

			out << "v " << vertices[i].x << " " << vertices[i].y << " " << vertices[i].z << "\n";



		out << "\n# " << vertex_normals.size() << " vertex normals" << "\n";

		for(size_t i = 0; i < vertex_normals.size(); i++)

			out << "vn " << vertex_normals[i].x << " " << vertex_normals[i].y << " " << vertex_normals[i].z << "\n";



		out << "\n# " << triangles.size() << " triangles" << "\n";

		for(size_t i = 0; i < triangles.size(); i++)

			out << "f " << triangles[i].vertex_indices[0]+1 << "//" << triangles[i].vertex_indices[0]+1 << " "

						<< triangles[i].vertex_indices[1]+1 << "//" << triangles[i].vertex_indices[1]+1 << " "

						<< triangles[i].vertex_indices[2]+1 << "//" << triangles[i].vertex_indices[2]+1 << " "

						<< "\n";



		out.close();

	}



protected:

	void ParseObjLine(const string &line)

	{

		if(line == "")

			return;



		istringstream in(lower_string(line));



		long unsigned int token_index = 0;

		string token("");



		#define PROCESS_VERTEX			0

		#define PROCESS_VERTEX_NORMAL	1

		#define PROCESS_TRIANGLE		2

		unsigned char processing_type = 0;



		vertex temp_vertex;

		vertex temp_vertex_normal;

		triangle temp_triangle;



		while(in >> token && token_index < 4)

		{

			if(token_index == 0)

			{

				if(token == "v")

					processing_type = PROCESS_VERTEX;

				else if(token == "vn")

					processing_type = PROCESS_VERTEX_NORMAL;

				else if(token == "f")

					processing_type = PROCESS_TRIANGLE;

				else

					return;

			}

			else if(token_index == 1)

			{

				if(processing_type == PROCESS_VERTEX)

				{

					temp_vertex.x = atof(token.c_str());

				}

				else if(processing_type == PROCESS_VERTEX_NORMAL)

				{

					temp_vertex_normal.x = atof(token.c_str());

				}

				else if(processing_type == PROCESS_TRIANGLE)

				{

					size_t pos = token.find_first_of("/");



					if(pos != string::npos)

						token == token.substr(0, pos);



					istringstream local_in;

					local_in.str(token);



					local_in >> temp_triangle.vertex_indices[0];

					temp_triangle.vertex_normal_indices[0] = temp_triangle.vertex_indices[0];

				}

			}

			else if(token_index == 2)

			{

				if(processing_type == PROCESS_VERTEX)

				{

					temp_vertex.y = atof(token.c_str());

				}

				else if(processing_type == PROCESS_VERTEX_NORMAL)

				{

					temp_vertex_normal.y = atof(token.c_str());

				}

				else if(processing_type == PROCESS_TRIANGLE)

				{

					size_t pos = token.find_first_of("/");



					if(pos != string::npos)

						token == token.substr(0, pos);



					istringstream local_in;

					local_in.str(token);



					local_in >> temp_triangle.vertex_indices[1];

					temp_triangle.vertex_normal_indices[1] = temp_triangle.vertex_indices[1];

				}

			}

			else if(token_index == 3)

			{

				if(processing_type == PROCESS_VERTEX)

				{

					temp_vertex.z = atof(token.c_str());

				}

				else if(processing_type == PROCESS_VERTEX_NORMAL)

				{

					temp_vertex_normal.z = atof(token.c_str());

				}

				else if(processing_type == PROCESS_TRIANGLE)

				{

					size_t pos = token.find_first_of("/");



					if(pos != string::npos)

						token == token.substr(0, pos);



					istringstream local_in;

					local_in.str(token);



					local_in >> temp_triangle.vertex_indices[2];

					temp_triangle.vertex_normal_indices[2] = temp_triangle.vertex_indices[2];

				}

			}



			token_index++;

		}



		if(token_index != 4)

			return;



		if(processing_type == PROCESS_VERTEX)

		{

			vertices.push_back(temp_vertex);

		}

		else if(processing_type == PROCESS_VERTEX_NORMAL)

		{

			vertex_normals.push_back(temp_vertex_normal);

		}

		else if(processing_type == PROCESS_TRIANGLE)

		{

			temp_triangle.vertex_indices[0]--;

			temp_triangle.vertex_indices[1]--;

			temp_triangle.vertex_indices[2]--;



			temp_triangle.vertex_normal_indices[0]--;

			temp_triangle.vertex_normal_indices[1]--;

			temp_triangle.vertex_normal_indices[2]--;



			triangles.push_back(temp_triangle);

		}

	}



	void ParseObjFile(const string &in_obj_filename)

	{

		ifstream in(in_obj_filename.c_str());



		if(in.fail())

			throw runtime_error("Could not open file.");



		string line("");



		while(getline(in, line))

			ParseObjLine(line);



		if(in.fail() && !in.eof())

			throw runtime_error("Could not fully read file.");



		in.close();

	}



	void ValidateIndices()

	{

		if(vertices.size() != vertex_normals.size())

			GenerateVertexNormalsFromVertices();



		long unsigned int vertex_size = vertices.size();

		long unsigned int vertex_normals_size = vertex_normals.size();



		for(size_t i = 0; i < triangles.size(); i++)

		{

			if(triangles[i].vertex_indices[0] >= vertex_size || triangles[i].vertex_normal_indices[0] >= vertex_normals_size)

				throw runtime_error("Data integrity failure.");



			if(triangles[i].vertex_indices[1] >= vertex_size || triangles[i].vertex_normal_indices[1] >= vertex_normals_size)

				throw runtime_error("Data integrity failure.");



			if(triangles[i].vertex_indices[2] >= vertex_size || triangles[i].vertex_normal_indices[2] >= vertex_normals_size)

				throw runtime_error("Data integrity failure.");

		}

	}



	void GenerateVertexNormalsFromVertices()

	{

		vector<vertex> face_normals;



		try

		{

			face_normals.reserve(triangles.size());

			face_normals.resize(triangles.size());

		}

		catch(bad_alloc)

		{

			throw runtime_error("Memory allocation failure.");

		}



		for(size_t i = 0; i < triangles.size(); i++)

		{

			vertex v[3];



			// for each vertex in the triangle

			for(unsigned char j = 0; j < 3; j++)

			{

				// else, extract position data

				v[j].x = vertices[triangles[i].vertex_indices[j]].x;

				v[j].y = vertices[triangles[i].vertex_indices[j]].y;

				v[j].z = vertices[triangles[i].vertex_indices[j]].z;

			}



			// calculate vectors along two triangle edges

			double x1 = v[0].x - v[1].x;

			double y1 = v[0].y - v[1].y;

			double z1 = v[0].z - v[1].z;



			double x2 = v[1].x - v[2].x;

			double y2 = v[1].y - v[2].y;

			double z2 = v[1].z - v[2].z;



			// calculate face normal through cross product

			face_normals[i].x = ( y1 * z2 ) - ( z1 * y2 );

			face_normals[i].y = ( z1 * x2 ) - ( x1 * z2 );

			face_normals[i].z = ( x1 * y2 ) - ( y1 * x2 );



			double len = sqrt(face_normals[i].x*face_normals[i].x + face_normals[i].y*face_normals[i].y + face_normals[i].z*face_normals[i].z);



			if(len != 1.0)

			{

				face_normals[i].x /= len;

				face_normals[i].y /= len;

				face_normals[i].z /= len;

			}

		}



		// resize vertex normals

		try

		{

			vertex_normals.reserve(vertices.size());

			vertex_normals.resize(vertices.size());

		}

		catch(bad_alloc)

		{

			throw runtime_error("Memory allocation failure");

		}



		vector< vector< vertex > > temp_normals;

		temp_normals.resize(vertex_normals.size());



		size_t normal_index = 0;



		for(size_t i = 0; i < triangles.size(); i++)

		{

			temp_normals[triangles[i].vertex_indices[0]].push_back(face_normals[normal_index]);

			temp_normals[triangles[i].vertex_indices[1]].push_back(face_normals[normal_index]);

			temp_normals[triangles[i].vertex_indices[2]].push_back(face_normals[normal_index]);



			normal_index++;

		}



		for(size_t i = 0; i < vertex_normals.size(); i++)

		{

			double temp_x = 0.0f;

			double temp_y = 0.0f;

			double temp_z = 0.0f;



			// add up all face normals associated with this vertex

			for(size_t j = 0; j < temp_normals[i].size(); j++)

			{

				double local_temp_x = temp_normals[i][j].x;

				double local_temp_y = temp_normals[i][j].y;

				double local_temp_z = temp_normals[i][j].z;



				double local_len = sqrt(local_temp_x*local_temp_x + local_temp_y*local_temp_y + local_temp_z*local_temp_z);



				if(local_len != 1.0f)

				{

					local_temp_x /= local_len;

					local_temp_y /= local_len;

					local_temp_z /= local_len;

				}



				temp_x += local_temp_x;

				temp_y += local_temp_y;

				temp_z += local_temp_z;

			}



			// average them using a flat linear

			temp_x /= temp_normals[i].size();

			temp_y /= temp_normals[i].size();

			temp_z /= temp_normals[i].size();



			// normalize the final result

			double len = sqrt(temp_x*temp_x + temp_y*temp_y + temp_z*temp_z);



			if(len != 1.0f)

			{

				temp_x /= len;

				temp_y /= len;

				temp_z /= len;

			}



			vertex_normals[i].x = temp_x;

			vertex_normals[i].y = temp_y;

			vertex_normals[i].z = temp_z;

		}

	}

};
